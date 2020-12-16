/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional, Optionals, Type } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { UrlObject } from '../api/AddOnManager';
import DOMUtils from '../api/dom/DOMUtils';
import EventUtils from '../api/dom/EventUtils';
import ScriptLoader from '../api/dom/ScriptLoader';
import StyleSheetLoader from '../api/dom/StyleSheetLoader';
import Editor from '../api/Editor';
import Env from '../api/Env';
import IconManager from '../api/IconManager';
import NotificationManager from '../api/NotificationManager';
import PluginManager from '../api/PluginManager';
import * as Settings from '../api/Settings';
import ThemeManager from '../api/ThemeManager';
import I18n from '../api/util/I18n';
import Tools from '../api/util/Tools';
import WindowManager from '../api/WindowManager';
import * as NodeType from '../dom/NodeType';
import * as StyleSheetLoaderRegistry from '../dom/StyleSheetLoaderRegistry';
import * as ErrorReporter from '../ErrorReporter';
import * as Init from './Init';

const DOM = DOMUtils.DOM;

const hasSkipLoadPrefix = (name) => {
  return name.charAt(0) === '-';
};

const loadLanguage = (scriptLoader, editor: Editor) => {
  const languageCode = Settings.getLanguageCode(editor);
  const languageUrl = Settings.getLanguageUrl(editor);

  if (I18n.hasCode(languageCode) === false && languageCode !== 'en') {
    const url = languageUrl !== '' ? languageUrl : editor.editorManager.baseURL + '/langs/' + languageCode + '.js';

    scriptLoader.add(url, Fun.noop, undefined, () => {
      ErrorReporter.languageLoadError(editor, url, languageCode);
    });
  }
};

const loadTheme = (scriptLoader: ScriptLoader, editor: Editor, suffix, callback) => {
  const theme = Settings.getTheme(editor);

  if (Type.isString(theme)) {
    if (!hasSkipLoadPrefix(theme) && !ThemeManager.urls.hasOwnProperty(theme)) {
      const themeUrl = Settings.getThemeUrl(editor);

      if (themeUrl) {
        ThemeManager.load(theme, editor.documentBaseURI.toAbsolute(themeUrl));
      } else {
        ThemeManager.load(theme, 'themes/' + theme + '/theme' + suffix + '.js');
      }
    }

    scriptLoader.loadQueue(() => {
      ThemeManager.waitFor(theme, callback);
    });
  } else {
    callback();
  }
};

interface UrlMeta {
  url: string;
  name: Optional<string>;
}

const getIconsUrlMetaFromUrl = (editor: Editor): Optional<UrlMeta> => Optional.from(Settings.getIconsUrl(editor))
  .filter((url) => url.length > 0)
  .map((url) => ({
    url,
    name: Optional.none()
  }));

const getIconsUrlMetaFromName = (editor: Editor, name: string | undefined, suffix: string): Optional<UrlMeta> => Optional.from(name)
  .filter((name) => name.length > 0 && !IconManager.has(name))
  .map((name) => ({
    url: `${editor.editorManager.baseURL}/icons/${name}/icons${suffix}.js`,
    name: Optional.some(name)
  }));

const loadIcons = (scriptLoader: ScriptLoader, editor: Editor, suffix: string) => {
  const defaultIconsUrl = getIconsUrlMetaFromName(editor, 'default', suffix);
  const customIconsUrl = getIconsUrlMetaFromUrl(editor).orThunk(() => getIconsUrlMetaFromName(editor, Settings.getIconPackName(editor), ''));

  Arr.each(Optionals.cat([ defaultIconsUrl, customIconsUrl ]), (urlMeta) => {
    scriptLoader.add(urlMeta.url, Fun.noop, undefined, () => {
      ErrorReporter.iconsLoadError(editor, urlMeta.url, urlMeta.name.getOrUndefined());
    });
  });
};

const loadPlugins = (editor: Editor, suffix: string) => {
  Tools.each(Settings.getExternalPlugins(editor), (url: string, name: string): void => {
    PluginManager.load(name, url, Fun.noop, undefined, () => {
      ErrorReporter.pluginLoadError(editor, url, name);
    });
    // This should be changed to some type of setParam once such an API is available.
    editor.settings.plugins += ' ' + name;
  });

  Tools.each(Settings.getPlugins(editor).split(/[ ,]/), (plugin) => {
    plugin = Tools.trim(plugin);

    if (plugin && !PluginManager.urls[plugin]) {
      if (hasSkipLoadPrefix(plugin)) {
        plugin = plugin.substr(1, plugin.length);

        const dependencies = PluginManager.dependencies(plugin);

        Tools.each(dependencies, (depPlugin) => {
          const defaultSettings = {
            prefix: 'plugins/',
            resource: depPlugin,
            suffix: '/plugin' + suffix + '.js'
          };

          const dep = PluginManager.createUrl(defaultSettings, depPlugin);
          PluginManager.load(dep.resource, dep, Fun.noop, undefined, () => {
            ErrorReporter.pluginLoadError(editor, dep.prefix + dep.resource + dep.suffix, dep.resource);
          });
        });
      } else {
        const url: UrlObject = {
          prefix: 'plugins/',
          resource: plugin,
          suffix: '/plugin' + suffix + '.js'
        };

        PluginManager.load(plugin, url, Fun.noop, undefined, () => {
          ErrorReporter.pluginLoadError(editor, url.prefix + url.resource + url.suffix, plugin);
        });
      }
    }
  });
};

const loadScripts = (editor: Editor, suffix: string) => {
  const scriptLoader = ScriptLoader.ScriptLoader;

  loadTheme(scriptLoader, editor, suffix, () => {
    loadLanguage(scriptLoader, editor);
    loadIcons(scriptLoader, editor, suffix);
    loadPlugins(editor, suffix);

    scriptLoader.loadQueue(() => {
      if (!editor.removed) {
        Init.init(editor);
      }
    }, editor, () => {
      if (!editor.removed) {
        Init.init(editor);
      }
    });
  });
};

const getStyleSheetLoader = (element: SugarElement<Element>, editor: Editor): StyleSheetLoader =>
  StyleSheetLoaderRegistry.instance.forElement(element, {
    contentCssCors: Settings.hasContentCssCors(editor),
    referrerPolicy: Settings.getReferrerPolicy(editor)
  });

const render = (editor: Editor) => {
  const id = editor.id;

  // The user might have bundled multiple language packs so we need to switch the active code to the user specified language
  I18n.setCode(Settings.getLanguageCode(editor));

  const readyHandler = () => {
    DOM.unbind(window, 'ready', readyHandler);
    editor.render();
  };

  // Page is not loaded yet, wait for it
  if (!EventUtils.Event.domLoaded) {
    DOM.bind(window, 'ready', readyHandler);
    return;
  }

  // Element not found, then skip initialization
  if (!editor.getElement()) {
    return;
  }

  // No editable support old iOS versions etc
  if (!Env.contentEditable) {
    return;
  }

  // snapshot the element we're going to render to
  const element = SugarElement.fromDom(editor.getElement());
  const snapshot = Attribute.clone(element);
  editor.on('remove', () => {
    Arr.eachr(element.dom.attributes, (attr) =>
      Attribute.remove(element, attr.name)
    );
    Attribute.setAll(element, snapshot);
  });

  editor.ui.styleSheetLoader = getStyleSheetLoader(element, editor);

  // Hide target element early to prevent content flashing
  if (!Settings.isInline(editor)) {
    editor.orgVisibility = editor.getElement().style.visibility;
    editor.getElement().style.visibility = 'hidden';
  } else {
    editor.inline = true;
  }

  // TODO: Investigate the types here
  const form = (editor.getElement() as HTMLFormElement).form || DOM.getParent(id, 'form');
  if (form) {
    editor.formElement = form;

    // Add hidden input for non input elements inside form elements
    if (Settings.hasHiddenInput(editor) && !NodeType.isTextareaOrInput(editor.getElement())) {
      DOM.insertAfter(DOM.create('input', { type: 'hidden', name: id }), id);
      editor.hasHiddenInput = true;
    }

    // Pass submit/reset from form to editor instance
    editor.formEventDelegate = (e) => {
      editor.fire(e.type, e);
    };

    DOM.bind(form, 'submit reset', editor.formEventDelegate);

    // Reset contents in editor when the form is reset
    editor.on('reset', () => {
      editor.resetContent();
    });

    // Check page uses id="submit" or name="submit" for it's submit button
    if (Settings.shouldPatchSubmit(editor) && !form.submit.nodeType && !form.submit.length && !form._mceOldSubmit) {
      form._mceOldSubmit = form.submit;
      form.submit = () => {
        editor.editorManager.triggerSave();
        editor.setDirty(false);

        return form._mceOldSubmit(form);
      };
    }
  }

  editor.windowManager = WindowManager(editor);
  editor.notificationManager = NotificationManager(editor);

  if (Settings.isEncodingXml(editor)) {
    editor.on('GetContent', (e) => {
      if (e.save) {
        e.content = DOM.encode(e.content);
      }
    });
  }

  if (Settings.shouldAddFormSubmitTrigger(editor)) {
    editor.on('submit', () => {
      if (editor.initialized) {
        editor.save();
      }
    });
  }

  if (Settings.shouldAddUnloadTrigger(editor)) {
    editor._beforeUnload = () => {
      if (editor.initialized && !editor.destroyed && !editor.isHidden()) {
        editor.save({ format: 'raw', no_events: true, set_dirty: false });
      }
    };

    editor.editorManager.on('BeforeUnload', editor._beforeUnload);
  }

  editor.editorManager.add(editor);
  loadScripts(editor, editor.suffix);
};

export {
  render
};
