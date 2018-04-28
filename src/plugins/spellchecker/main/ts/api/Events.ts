/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';

const fireSpellcheckStart = function (editor: Editor) {
  return editor.fire('SpellcheckStart');
};

const fireSpellcheckEnd = function (editor: Editor) {
  return editor.fire('SpellcheckEnd');
};

export default {
  fireSpellcheckStart,
  fireSpellcheckEnd
};