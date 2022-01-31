/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj, Optional, Optionals, Type } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import EventUtils from '../api/dom/EventUtils';
import ScriptLoader from '../api/dom/ScriptLoader';
import StyleSheetLoader from '../api/dom/StyleSheetLoader';
import Editor from '../api/Editor';
import IconManager from '../api/IconManager';
import NotificationManager from '../api/NotificationManager';
import * as Options from '../api/Options';
import PluginManager from '../api/PluginManager';
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

const loadLanguage = (scriptLoader: ScriptLoader, editor: Editor) => {
  const languageCode = Options.getLanguageCode(editor);
  const languageUrl = Options.getLanguageUrl(editor);

  if (I18n.hasCode(languageCode) === false && languageCode !== 'en') {
    const url = languageUrl !== '' ? languageUrl : editor.editorManager.baseURL + '/langs/' + languageCode + '.js';

    scriptLoader.add(url).catch(() => {
      ErrorReporter.languageLoadError(editor, url, languageCode);
    });
  }
};

const loadTheme = (scriptLoader: ScriptLoader, editor: Editor, suffix: string): Promise<void> => {
  const theme = Options.getTheme(editor);

  if (Type.isString(theme)) {
    if (!hasSkipLoadPrefix(theme) && !Obj.has(ThemeManager.urls, theme)) {
      const themeUrl = Options.getThemeUrl(editor);
      const url = themeUrl ? editor.documentBaseURI.toAbsolute(themeUrl) : 'themes/' + theme + '/theme' + suffix + '.js';
      ThemeManager.load(theme, url).catch(() => {
        ErrorReporter.themeLoadError(editor, url, theme);
      });
    }

    const waitForTheme = () => ThemeManager.waitFor(theme);
    return scriptLoader.loadQueue().then(waitForTheme, waitForTheme);
  } else {
    return Promise.resolve();
  }
};

interface UrlMeta {
  url: string;
  name: Optional<string>;
}

const getIconsUrlMetaFromUrl = (editor: Editor): Optional<UrlMeta> => Optional.from(Options.getIconsUrl(editor))
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
  const customIconsUrl = getIconsUrlMetaFromUrl(editor).orThunk(() => getIconsUrlMetaFromName(editor, Options.getIconPackName(editor), ''));

  Arr.each(Optionals.cat([ defaultIconsUrl, customIconsUrl ]), (urlMeta) => {
    scriptLoader.add(urlMeta.url).catch(() => {
      ErrorReporter.iconsLoadError(editor, urlMeta.url, urlMeta.name.getOrUndefined());
    });
  });
};

const loadPlugins = (editor: Editor, suffix: string) => {
  const loadPlugin = (name: string, url: string) => {
    PluginManager.load(name, url).catch(() => {
      ErrorReporter.pluginLoadError(editor, url, name);
    });
  };

  Obj.each(Options.getExternalPlugins(editor), (url, name) => {
    loadPlugin(name, url);
    editor.options.set('plugins', Options.getPlugins(editor) + ' ' + name);
  });

  Arr.each(Options.getPlugins(editor).split(/[ ,]/), (plugin) => {
    plugin = Tools.trim(plugin);

    if (plugin && !PluginManager.urls[plugin]) {
      if (!hasSkipLoadPrefix(plugin)) {
        loadPlugin(plugin, 'plugins/' + plugin + '/plugin' + suffix + '.js');
      }
    }
  });
};

const loadScripts = (editor: Editor, suffix: string) => {
  const scriptLoader = ScriptLoader.ScriptLoader;

  const initIfNotRemoved = () => {
    if (!editor.removed) {
      Init.init(editor);
    }
  };

  loadTheme(scriptLoader, editor, suffix).then(() => {
    loadLanguage(scriptLoader, editor);
    loadIcons(scriptLoader, editor, suffix);
    loadPlugins(editor, suffix);
    scriptLoader.loadQueue().then(initIfNotRemoved, initIfNotRemoved);
  });
};

const getStyleSheetLoader = (element: SugarElement<Element>, editor: Editor): StyleSheetLoader =>
  StyleSheetLoaderRegistry.instance.forElement(element, {
    contentCssCors: Options.hasContentCssCors(editor),
    referrerPolicy: Options.getReferrerPolicy(editor)
  });

const render = (editor: Editor) => {
  const id = editor.id;

  // The user might have bundled multiple language packs so we need to switch the active code to the user specified language
  I18n.setCode(Options.getLanguageCode(editor));

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
  if (!Options.isInline(editor)) {
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
    if (Options.hasHiddenInput(editor) && !NodeType.isTextareaOrInput(editor.getElement())) {
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
    if (Options.shouldPatchSubmit(editor) && !form.submit.nodeType && !form.submit.length && !form._mceOldSubmit) {
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

  if (Options.isEncodingXml(editor)) {
    editor.on('GetContent', (e) => {
      if (e.save && Type.isString(e.content)) {
        e.content = DOM.encode(e.content);
      }
    });
  }

  if (Options.shouldAddFormSubmitTrigger(editor)) {
    editor.on('submit', () => {
      if (editor.initialized) {
        editor.save();
      }
    });
  }

  if (Options.shouldAddUnloadTrigger(editor)) {
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
