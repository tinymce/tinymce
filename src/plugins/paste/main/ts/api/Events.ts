/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const firePastePreProcess = function (editor, html, internal, isWordHtml) {
  return editor.fire('PastePreProcess', { content: html, internal, wordContent: isWordHtml });
};

const firePastePostProcess = function (editor, node, internal, isWordHtml) {
  return editor.fire('PastePostProcess', { node, internal, wordContent: isWordHtml });
};

const firePastePlainTextToggle = function (editor, state) {
  return editor.fire('PastePlainTextToggle', { state });
};

const firePaste = function (editor, ieFake) {
  return editor.fire('paste', { ieFake });
};

export default {
  firePastePreProcess,
  firePastePostProcess,
  firePastePlainTextToggle,
  firePaste
};