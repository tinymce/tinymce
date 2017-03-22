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
 * This class contains all core logic for the save plugin.
 *
 * @class tinymce.save.Plugin
 * @private
 */
define(
  'tinymce.plugins.save.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.EditorManager',
    'tinymce.core.util.Tools'
  ],
  function (PluginManager, DOMUtils, EditorManager, Tools) {
    PluginManager.add('save', function (editor) {
      function save() {
        var formObj;

        formObj = DOMUtils.DOM.getParent(editor.id, 'form');

        if (editor.getParam("save_enablewhendirty", true) && !editor.isDirty()) {
          return;
        }

        EditorManager.triggerSave();

        // Use callback instead
        if (editor.getParam("save_onsavecallback")) {
          editor.execCallback('save_onsavecallback', editor);
          editor.nodeChanged();
          return;
        }

        if (formObj) {
          editor.setDirty(false);

          if (!formObj.onsubmit || formObj.onsubmit()) {
            if (typeof formObj.submit == "function") {
              formObj.submit();
            } else {
              displayErrorMessage(editor.translate("Error: Form submit field collision."));
            }
          }

          editor.nodeChanged();
        } else {
          displayErrorMessage(editor.translate("Error: No form element found."));
        }
      }

      function displayErrorMessage(message) {
        editor.notificationManager.open({
          text: message,
          type: 'error'
        });
      }

      function cancel() {
        var h = Tools.trim(editor.startContent);

        // Use callback instead
        if (editor.getParam("save_oncancelcallback")) {
          editor.execCallback('save_oncancelcallback', editor);
          return;
        }

        editor.setContent(h);
        editor.undoManager.clear();
        editor.nodeChanged();
      }

      function stateToggle() {
        var self = this;

        editor.on('nodeChange dirty', function () {
          self.disabled(editor.getParam("save_enablewhendirty", true) && !editor.isDirty());
        });
      }

      editor.addCommand('mceSave', save);
      editor.addCommand('mceCancel', cancel);

      editor.addButton('save', {
        icon: 'save',
        text: 'Save',
        cmd: 'mceSave',
        disabled: true,
        onPostRender: stateToggle
      });

      editor.addButton('cancel', {
        text: 'Cancel',
        icon: false,
        cmd: 'mceCancel',
        disabled: true,
        onPostRender: stateToggle
      });

      editor.addShortcut('Meta+S', '', 'mceSave');
    });

    return function () { };
  }
);