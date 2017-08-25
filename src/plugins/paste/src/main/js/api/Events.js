/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.paste.api.Events',
  [
  ],
  function () {
    var firePastePreProcess = function (editor, html, internal) {
      return editor.fire('PastePreProcess', { content: html, internal: internal });
    };

    var firePastePostProcess = function (editor, node, internal) {
      return editor.fire('PastePostProcess', { node: node, internal: internal });
    };

    var firePastePlainTextToggle = function (editor, state) {
      return editor.fire('PastePlainTextToggle', { state: state });
    };

    return {
      firePastePreProcess: firePastePreProcess,
      firePastePostProcess: firePastePostProcess,
      firePastePlainTextToggle: firePastePlainTextToggle
    };
  }
);
