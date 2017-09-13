/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.anchor.ui.Dialog',
  [
  ],
  function () {
    var isValidId = function (id) {
      // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
      return /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);
    };

    var open = function (editor) {
      var selectedNode = editor.selection.getNode();
      var isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
      var value = '';

      if (isAnchor) {
        value = selectedNode.id || selectedNode.name || '';
      }

      editor.windowManager.open({
        title: 'Anchor',
        body: { type: 'textbox', name: 'id', size: 40, label: 'Id', value: value },
        onsubmit: function (e) {
          var id = e.data.id;

          if (!isValidId(id)) {
            e.preventDefault();
            editor.windowManager.alert(
              'Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.'
            );
            return;
          }

          if (isAnchor) {
            selectedNode.removeAttribute('name');
            selectedNode.id = id;
          } else {
            editor.selection.collapse(true);
            editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
              id: id
            }));
          }
        }
      });
    };

    return {
      open: open
    };
  }
);