/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const applyListFormat = function (editor, listName, styleValue) {
  const cmd = listName === 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList';
  editor.execCommand(cmd, false, styleValue === false ? null : { 'list-style-type': styleValue });
};

export default {
  applyListFormat
};