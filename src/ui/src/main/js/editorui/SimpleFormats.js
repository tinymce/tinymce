/**
 * SimpleFormats.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.SimpleFormats',
  [
    'tinymce.core.util.Tools',
    'tinymce.ui.editorui.FormatUtils'
  ],
  function (Tools, FormatUtils) {
    var registerButtons = function (editor) {
      Tools.each({
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        subscript: 'Subscript',
        superscript: 'Superscript'
      }, function (text, name) {
        editor.addButton(name, {
          tooltip: text,
          onPostRender: FormatUtils.postRenderFormat(editor, name),
          onclick: FormatUtils.toggleFormat(editor, name)
        });
      });

      editor.addButton('removeformat', {
        title: 'Clear formatting',
        cmd: 'RemoveFormat'
      });
    };

    var registerMenuItems = function (editor) {
      Tools.each({
        bold: ['Bold', 'Bold', 'Meta+B'],
        italic: ['Italic', 'Italic', 'Meta+I'],
        underline: ['Underline', 'Underline', 'Meta+U'],
        strikethrough: ['Strikethrough', 'Strikethrough'],
        subscript: ['Subscript', 'Subscript'],
        superscript: ['Superscript', 'Superscript'],
        removeformat: ['Clear formatting', 'RemoveFormat']
      }, function (item, name) {
        editor.addMenuItem(name, {
          text: item[0],
          icon: name,
          shortcut: item[2],
          cmd: item[1]
        });
      });

      editor.addMenuItem('codeformat', {
        text: 'Code',
        icon: 'code',
        onclick: FormatUtils.toggleFormat(editor, 'code')
      });
    };

    var register = function (editor) {
      registerButtons(editor);
      registerMenuItems(editor);
    };

    return {
      register: register
    };
  }
);
