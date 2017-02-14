/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the autosave plugin.
 *
 * @class tinymce.autosave.Plugin
 * @private
 */
define(
  'tinymce.plugins.autosave.Plugin',
  [
    'tinymce.core.EditorManager',
    'tinymce.core.PluginManager',
    'tinymce.core.util.LocalStorage',
    'tinymce.core.util.Tools',
    'global!window'
  ],
  function (EditorManager, PluginManager, LocalStorage, Tools, window) {
    EditorManager._beforeUnloadHandler = function () {
      var msg;

      Tools.each(EditorManager.editors, function (editor) {
        // Store a draft for each editor instance
        if (editor.plugins.autosave) {
          editor.plugins.autosave.storeDraft();
        }

        // Setup a return message if the editor is dirty
        if (!msg && editor.isDirty() && editor.getParam("autosave_ask_before_unload", true)) {
          msg = editor.translate("You have unsaved changes are you sure you want to navigate away?");
        }
      });

      return msg;
    };

    PluginManager.add('autosave', function (editor) {
      var settings = editor.settings, prefix, started;

      prefix = settings.autosave_prefix || 'tinymce-autosave-{path}{query}-{id}-';
      prefix = prefix.replace(/\{path\}/g, document.location.pathname);
      prefix = prefix.replace(/\{query\}/g, document.location.search);
      prefix = prefix.replace(/\{id\}/g, editor.id);

      function parseTime(time, defaultTime) {
        var multipels = {
          s: 1000,
          m: 60000
        };

        time = /^(\d+)([ms]?)$/.exec('' + (time || defaultTime));

        return (time[2] ? multipels[time[2]] : 1) * parseInt(time, 10);
      }

      function hasDraft() {
        var time = parseInt(LocalStorage.getItem(prefix + "time"), 10) || 0;

        if (new Date().getTime() - time > settings.autosave_retention) {
          removeDraft(false);
          return false;
        }

        return true;
      }

      function removeDraft(fire) {
        LocalStorage.removeItem(prefix + "draft");
        LocalStorage.removeItem(prefix + "time");

        if (fire !== false) {
          editor.fire('RemoveDraft');
        }
      }

      function storeDraft() {
        if (!isEmpty() && editor.isDirty()) {
          LocalStorage.setItem(prefix + "draft", editor.getContent({ format: 'raw', no_events: true }));
          LocalStorage.setItem(prefix + "time", new Date().getTime());
          editor.fire('StoreDraft');
        }
      }

      function restoreDraft() {
        if (hasDraft()) {
          editor.setContent(LocalStorage.getItem(prefix + "draft"), { format: 'raw' });
          editor.fire('RestoreDraft');
        }
      }

      function startStoreDraft() {
        if (!started) {
          setInterval(function () {
            if (!editor.removed) {
              storeDraft();
            }
          }, settings.autosave_interval);

          started = true;
        }
      }

      settings.autosave_interval = parseTime(settings.autosave_interval, '30s');
      settings.autosave_retention = parseTime(settings.autosave_retention, '20m');

      function postRender() {
        var self = this;

        self.disabled(!hasDraft());

        editor.on('StoreDraft RestoreDraft RemoveDraft', function () {
          self.disabled(!hasDraft());
        });

        startStoreDraft();
      }

      function restoreLastDraft() {
        editor.undoManager.beforeChange();
        restoreDraft();
        removeDraft();
        editor.undoManager.add();
      }

      editor.addButton('restoredraft', {
        title: 'Restore last draft',
        onclick: restoreLastDraft,
        onPostRender: postRender
      });

      editor.addMenuItem('restoredraft', {
        text: 'Restore last draft',
        onclick: restoreLastDraft,
        onPostRender: postRender,
        context: 'file'
      });

      function isEmpty(html) {
        var forcedRootBlockName = editor.settings.forced_root_block;

        html = Tools.trim(typeof html == "undefined" ? editor.getBody().innerHTML : html);

        return html === '' || new RegExp(
          '^<' + forcedRootBlockName + '[^>]*>((\u00a0|&nbsp;|[ \t]|<br[^>]*>)+?|)<\/' + forcedRootBlockName + '>|<br>$', 'i'
        ).test(html);
      }

      if (editor.settings.autosave_restore_when_empty !== false) {
        editor.on('init', function () {
          if (hasDraft() && isEmpty()) {
            restoreDraft();
          }
        });

        editor.on('saveContent', function () {
          removeDraft();
        });
      }

      window.onbeforeunload = EditorManager._beforeUnloadHandler;

      this.hasDraft = hasDraft;
      this.storeDraft = storeDraft;
      this.restoreDraft = restoreDraft;
      this.removeDraft = removeDraft;
      this.isEmpty = isEmpty;
    });

    return function () { };
  }
);