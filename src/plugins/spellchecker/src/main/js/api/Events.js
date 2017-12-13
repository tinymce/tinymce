/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var fireSpellcheckStart = function (editor) {
  return editor.fire('SpellcheckStart');
};

var fireSpellcheckEnd = function (editor) {
  return editor.fire('SpellcheckEnd');
};

export default <any> {
  fireSpellcheckStart: fireSpellcheckStart,
  fireSpellcheckEnd: fireSpellcheckEnd
};