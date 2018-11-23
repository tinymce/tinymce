/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import * as FormatUtils from './FormatUtils';

const registerFormatButtons = function (editor) {
  Tools.each({
    bold: 'Bold',
    italic: 'Italic',
    underline: 'Underline',
    strikethrough: 'Strikethrough',
    subscript: 'Subscript',
    superscript: 'Superscript'
  }, function (text, name) {
    editor.addButton(name, {
      active: false,
      tooltip: text,
      onPostRender: FormatUtils.postRenderFormatToggle(editor, name),
      onclick: FormatUtils.toggleFormat(editor, name)
    });
  });
};

const registerCommandButtons = function (editor) {
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

const registerCommandToggleButtons = function (editor) {
  Tools.each({
    blockquote: ['Blockquote', 'mceBlockQuote'],
    subscript: ['Subscript', 'Subscript'],
    superscript: ['Superscript', 'Superscript']
  }, function (item, name) {
    editor.addButton(name, {
      active: false,
      tooltip: item[0],
      cmd: item[1],
      onPostRender: FormatUtils.postRenderFormatToggle(editor, name)
    });
  });
};

const registerButtons = function (editor) {
  registerFormatButtons(editor);
  registerCommandButtons(editor);
  registerCommandToggleButtons(editor);
};

const registerMenuItems = function (editor) {
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

const register = function (editor) {
  registerButtons(editor);
  registerMenuItems(editor);
};

export default {
  register
};