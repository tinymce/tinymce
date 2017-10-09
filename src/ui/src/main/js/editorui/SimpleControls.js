/**
 * SimpleControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.ui.editorui.SimpleControls',
  [
    'tinymce.core.util.Tools',
    'tinymce.ui.editorui.FormatUtils'
  ],
  function (Tools, FormatUtils) {
    var registerFormatButtons = function (editor) {
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
    };

    var registerCommandButtons = function (editor) {
      Tools.each({
        outdent: ['Decrease indent', 'Outdent'],
        indent: ['Increase indent', 'Indent'],
        cut: ['Cut', 'Cut'],
        copy: ['Copy', 'Copy'],
        paste: ['Paste', 'Paste'],
        help: ['Help', 'mceHelp'],
        selectall: ['Select all', 'SelectAll'],
        visualaid: ['Visual aids', 'mceToggleVisualAid'],
        newdocument: ['New document', 'mceNewDocument'],
        removeformat: ['Clear formatting', 'RemoveFormat'],
        remove: ['Remove', 'Delete']
      }, function (item, name) {
        editor.addButton(name, {
          tooltip: item[0],
          cmd: item[1]
        });
      });
    };

    var registerCommandToggleButtons = function (editor) {
      Tools.each({
        blockquote: ['Blockquote', 'mceBlockQuote'],
        subscript: ['Subscript', 'Subscript'],
        superscript: ['Superscript', 'Superscript']
      }, function (item, name) {
        editor.addButton(name, {
          tooltip: item[0],
          cmd: item[1],
          onPostRender: FormatUtils.postRenderFormat(editor, name)
        });
      });
    };

    var registerButtons = function (editor) {
      registerFormatButtons(editor);
      registerCommandButtons(editor);
      registerCommandToggleButtons(editor);
    };

    var registerMenuItems = function (editor) {
      Tools.each({
        bold: ['Bold', 'Bold', 'Meta+B'],
        italic: ['Italic', 'Italic', 'Meta+I'],
        underline: ['Underline', 'Underline', 'Meta+U'],
        strikethrough: ['Strikethrough', 'Strikethrough'],
        subscript: ['Subscript', 'Subscript'],
        superscript: ['Superscript', 'Superscript'],
        removeformat: ['Clear formatting', 'RemoveFormat'],
        newdocument: ['New document', 'mceNewDocument'],
        cut: ['Cut', 'Cut', 'Meta+X'],
        copy: ['Copy', 'Copy', 'Meta+C'],
        paste: ['Paste', 'Paste', 'Meta+V'],
        selectall: ['Select all', 'SelectAll', 'Meta+A']
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
