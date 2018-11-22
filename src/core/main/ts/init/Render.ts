/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';
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
import { window } from '@ephox/dom-globals';

const DOM = DOMUtils.DOM;

const hasSkipLoadPrefix = function (name) {
  return name.charAt(0) === '-';
};

const loadLanguage = function (scriptLoader, editor) {
  const settings = editor.settings;

  if (settings.language && settings.language !== 'en' && !settings.language_url) {
    settings.language_url = editor.editorManager.baseURL + '/langs/' + settings.language + '.js';
  }

  if (settings.language_url && !editor.editorManager.i18n.data[settings.language]) {
    scriptLoader.add(settings.language_url);
  }
};

const loadTheme = function (scriptLoader, editor, suffix, callback) {
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

const loadPlugins = function (settings, suffix) {
  if (Tools.isArray(settings.plugins)) {
    settings.plugins = settings.plugins.join(' ');
  }

  Tools.each(settings.external_plugins, function (url, name) {
    PluginManager.load(name, url);
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
          PluginManager.load(dep.resource, dep);
        });
      } else {
        PluginManager.load(plugin, {
          prefix: 'plugins/',
          resource: plugin,
          suffix: '/plugin' + suffix + '.js'
        });
      }
    }
  });
};

const loadScripts = function (editor, suffix) {
  const scriptLoader = ScriptLoader.ScriptLoader;

  loadTheme(scriptLoader, editor, suffix, function () {
    loadLanguage(scriptLoader, editor);
    loadPlugins(editor.settings, suffix);

    scriptLoader.loadQueue(function () {
      if (!editor.removed) {
        Init.init(editor);
      }
    }, editor, function (urls) {
      ErrorReporter.pluginLoadError(editor, urls[0]);

      if (!editor.removed) {
        Init.init(editor);
      }
    });
  });
};

const render = function (editor) {
  const settings = editor.settings, id = editor.id;

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

  const form = editor.getElement().form || DOM.getParent(id, 'form');
  if (form) {
    editor.formElement = form;

    // Add hidden input for non input elements inside form elements
    if (settings.hidden_input && !/TEXTAREA|INPUT/i.test(editor.getElement().nodeName)) {
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
      editor.setContent(editor.startContent, { format: 'raw' });
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