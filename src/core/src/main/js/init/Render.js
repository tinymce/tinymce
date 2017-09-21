/**
 * Render.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.init.Render',
  [
    'global!window',
    'tinymce.core.api.NotificationManager',
    'tinymce.core.api.WindowManager',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.EventUtils',
    'tinymce.core.dom.ScriptLoader',
    'tinymce.core.Env',
    'tinymce.core.ErrorReporter',
    'tinymce.core.init.Init',
    'tinymce.core.PluginManager',
    'tinymce.core.ThemeManager',
    'tinymce.core.util.Tools'
  ],
  function (window, NotificationManager, WindowManager, DOMUtils, EventUtils, ScriptLoader, Env, ErrorReporter, Init, PluginManager, ThemeManager, Tools) {
    var DOM = DOMUtils.DOM;

    var loadScripts = function (editor, suffix) {
      var settings = editor.settings, scriptLoader = ScriptLoader.ScriptLoader;

      if (settings.language && settings.language != 'en' && settings.language != 'en_US' && !settings.language_url) {
        settings.language_url = editor.editorManager.baseURL + '/langs/' + settings.language + '.js';
      }

      if (settings.language_url) {
        scriptLoader.add(settings.language_url);
      }

      if (settings.theme && typeof settings.theme != "function" &&
        settings.theme.charAt(0) != '-' && !ThemeManager.urls[settings.theme]) {
        var themeUrl = settings.theme_url;

        if (themeUrl) {
          themeUrl = editor.documentBaseURI.toAbsolute(themeUrl);
        } else {
          themeUrl = 'themes/' + settings.theme + '/theme' + suffix + '.js';
        }

        ThemeManager.load(settings.theme, themeUrl);
      }

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
          if (plugin.charAt(0) === '-') {
            plugin = plugin.substr(1, plugin.length);

            var dependencies = PluginManager.dependencies(plugin);

            Tools.each(dependencies, function (dep) {
              var defaultSettings = {
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
    };

    var render = function (editor) {
      var settings = editor.settings, id = editor.id;

      function readyHandler() {
        DOM.unbind(window, 'ready', readyHandler);
        editor.render();
      }

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

      var form = editor.getElement().form || DOM.getParent(id, 'form');
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

      editor.windowManager = new WindowManager(editor);
      editor.notificationManager = new NotificationManager(editor);

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

    return {
      render: render
    };
  }
);
