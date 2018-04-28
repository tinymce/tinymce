/**
 * Settings.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getNonEditableClass = function (editor) {
  return editor.getParam('noneditable_noneditable_class', 'mceNonEditable');
};

const getEditableClass = function (editor) {
  return editor.getParam('noneditable_editable_class', 'mceEditable');
};

const getNonEditableRegExps = function (editor) {
  const nonEditableRegExps = editor.getParam('noneditable_regexp', []);

  if (nonEditableRegExps && nonEditableRegExps.constructor === RegExp) {
    return [nonEditableRegExps];
  } else {
    return nonEditableRegExps;
  }
};

export default {
  getNonEditableClass,
  getEditableClass,
  getNonEditableRegExps
};