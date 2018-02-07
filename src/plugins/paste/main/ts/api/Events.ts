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

const firePastePreProcess = function (editor: Editor, html, internal: boolean, isWordHtml: boolean) {
  return editor.fire('PastePreProcess', { content: html, internal, wordContent: isWordHtml });
};

const firePastePostProcess = function (editor: Editor, node, internal: boolean, isWordHtml: boolean) {
  return editor.fire('PastePostProcess', { node, internal, wordContent: isWordHtml });
};

const firePastePlainTextToggle = function (editor: Editor, state) {
  return editor.fire('PastePlainTextToggle', { state });
};

const firePaste = function (editor: Editor, ieFake) {
  return editor.fire('paste', { ieFake });
};

export default {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle,
  firePaste
};