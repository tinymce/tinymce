/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLFormElement, window } from '@ephox/dom-globals';
import { Type, Fun, Option } from '@ephox/katamari';
import NotificationManager from '../api/NotificationManager';
import WindowManager from '../api/WindowManager';
import DOMUtils from '../api/dom/DOMUtils';
import EventUtils from '../api/dom/EventUtils';
import ScriptLoader from '../api/dom/ScriptLoader';
import Env from '../api/Env';
import ErrorReporter from '../ErrorReporter';
import Init from './Init';
import PluginManager from '../api/PluginManager';
import ThemeManager from '../api/ThemeManager';
import Tools from '../api/util/Tools';
import Editor from '../api/Editor';
import Settings from '../api/Settings';
import I18n from '../api/util/I18n';
import { UrlObject } from '../api/AddOnManager';
import { RawEditorSettings } from '../api/SettingsTypes';
import IconManager from '../api/IconManager';
import NodeType from '../dom/NodeType';

const DOM = DOMUtils.DOM;

const hasSkipLoadPrefix = function (name) {
  return name.charAt(0) === '-';
};

const loadLanguage = (scriptLoader, editor: Editor) => {
  const languageCode = Settings.getLanguageCode(editor);
  const languageUrl = Settings.getLanguageUrl(editor);

  if (I18n.hasCode(languageCode) === false && languageCode !== 'en') {
    const url = languageUrl !== '' ? languageUrl : editor.editorManager.baseURL + '/langs/' + languageCode + '.js';

    scriptLoader.add(url, Fun.noop, undefined, () => {
      ErrorReporter.languageLoadError(url, languageCode);
    });
  }
};

const loadTheme = function (scriptLoader: ScriptLoader, editor: Editor, suffix, callback) {
  const settings = editor.settings, theme = settings.theme;

  if (Type.isString(theme)) {
    if (!hasSkipLoadPrefix(theme) && !ThemeManager.urls.hasOwnProperty(theme)) {
      const themeUrl = settings.theme_url;

      if (themeUrl) {
        ThemeManager.load(theme, editor.documentBaseURI.toAbsolute(themeUrl));
      } else {
        ThemeManager.load(theme, 'themes/' + theme + '/theme' + suffix + '.js');
      }
    }

    scriptLoader.loadQueue(function () {
      ThemeManager.waitFor(theme, callback);
    });
  } else {
    callback();
  }
};

interface UrlMeta {
  url: string;
  name: Option<string>;
}

const getIconsUrlMetaFromUrl = (editor: Editor): Option<UrlMeta> => {
  return Option.from(Settings.getIconsUrl(editor))
    .filter((url) => url.length > 0)
    .map((url) => {
      return {
        url,
        name: Option.none()
      };
    });
};

const getIconsUrlMetaFromName = (editor: Editor): Option<UrlMeta> => {
  return Option.from(Settings.getIconPackName(editor))
    .filter((name) => name.length > 0 && !IconManager.has(name))
    .map((name) => {
      return {
        url: `${editor.editorManager.baseURL}/icons/${name}/icons.js`,
        name: Option.some(name)
      };
    });
};

const loadIcons = (scriptLoader: ScriptLoader, editor: Editor) => {
  getIconsUrlMetaFromUrl(editor)
    .orThunk(() => getIconsUrlMetaFromName(editor))
    .each((urlMeta) => {
    scriptLoader.add(urlMeta.url, Fun.noop, undefined, () => {
      ErrorReporter.iconsLoadError(urlMeta.url, urlMeta.name.getOrUndefined());
    });
  });
};

const loadPlugins = (settings: RawEditorSettings, suffix: string) => {
  if (Type.isArray(settings.plugins)) {
    settings.plugins = settings.plugins.join(' ');
  }

  Tools.each(settings.external_plugins, function (url, name) {
    PluginManager.load(name, url, Fun.noop, undefined, () => {
      ErrorReporter.pluginLoadError(name, url);
    });
    settings.plugins += ' ' + name;
  });

  Tools.each(settings.plugins.split(/[ ,]/), function (plugin) {
    plugin = Tools.trim(plugin);

    if (plugin && !PluginManager.urls[plugin]) {
      if (hasSkipLoadPrefix(plugin)) {
        plugin = plugin.substr(1, plugin.length);

        const dependencies = PluginManager.dependencies(plugin);

        Tools.each(dependencies, function (dep) {
          const defaultSettings = {
            prefix: 'plugins/',
            resource: dep,
            suffix: '/plugin' + suffix + '.js'
          };

          dep = PluginManager.createUrl(defaultSettings, dep);
          PluginManager.load(dep.resource, dep, Fun.noop, undefined, () => {
            ErrorReporter.pluginLoadError(dep.prefix + dep.resource + dep.suffix, dep.resource);
          });
        });
      } else {
        const url: UrlObject = {
          prefix: 'plugins/',
          resource: plugin,
          suffix: '/plugin' + suffix + '.js'
        };

        PluginManager.load(plugin, url, Fun.noop, undefined, () => {
          ErrorReporter.pluginLoadError(url.prefix + url.resource + url.suffix, plugin);
        });
      }
    }
  });
};

const loadScripts = function (editor: Editor, suffix: string) {
  const scriptLoader = ScriptLoader.ScriptLoader;

  loadTheme(scriptLoader, editor, suffix, function () {
    loadLanguage(scriptLoader, editor);
    loadIcons(scriptLoader, editor);
    loadPlugins(editor.settings, suffix);

    scriptLoader.loadQueue(function () {
      if (!editor.removed) {
        Init.init(editor);
      }
    }, editor, function () {
      if (!editor.removed) {
        Init.init(editor);
      }
    });
  });
};

const render = function (editor: Editor) {
  const settings = editor.settings, id = editor.id;

  // The user might have bundled multiple language packs so we need to switch the active code to the user specified language
  I18n.setCode(Settings.getLanguageCode(editor));

  const readyHandler = function () {
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

  // Hide target element early to prevent content flashing
  if (!settings.inline) {
    editor.orgVisibility = editor.getElement().style.visibility;
    editor.getElement().style.visibility = 'hidden';
  } else {
    editor.inline = true;
  }

  const form = (editor.getElement() as HTMLFormElement).form || DOM.getParent(id, 'form');
  if (form) {
    editor.formElement = form;

    // Add hidden input for non input elements inside form elements
    if (settings.hidden_input && !NodeType.isTextareaOrInput(editor.getElement())) {
      DOM.insertAfter(DOM.create('input', { type: 'hidden', name: id }), id);
      editor.hasHiddenInput = true;
    }

    // Pass submit/reset from form to editor instance
    editor.formEventDelegate = function (e) {
      editor.fire(e.type, e);
    };

    DOM.bind(form, 'submit reset', editor.formEventDelegate);

    // Reset contents in editor when the form is reset
    editor.on('reset', function () {
      editor.resetContent();
    });

    // Check page uses id="submit" or name="submit" for it's submit button
    if (settings.submit_patch && !form.submit.nodeType && !form.submit.length && !form._mceOldSubmit) {
      form._mceOldSubmit = form.submit;
      form.submit = function () {
        editor.editorManager.triggerSave();
        editor.setDirty(false);

        return form._mceOldSubmit(form);
      };
    }
  }

  editor.windowManager = WindowManager(editor);
  editor.notificationManager = NotificationManager(editor);

  if (settings.encoding === 'xml') {
    editor.on('GetContent', function (e) {
      if (e.save) {
        e.content = DOM.encode(e.content);
      }
    });
  }

  if (settings.add_form_submit_trigger) {
    editor.on('submit', function () {
      if (editor.initialized) {
        editor.save();
      }
    });
  }

  if (settings.add_unload_trigger) {
    editor._beforeUnload = function () {
      if (editor.initialized && !editor.destroyed && !editor.isHidden()) {
        editor.save({ format: 'raw', no_events: true, set_dirty: false });
      }
    };

    editor.editorManager.on('BeforeUnload', editor._beforeUnload);
  }

  editor.editorManager.add(editor);
  loadScripts(editor, editor.suffix);
};

export default {
  render
};