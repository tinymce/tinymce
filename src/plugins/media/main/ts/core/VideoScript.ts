/**
 * VideoScript.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getVideoScriptMatch = function (prefixes, src) {
  // var prefixes = Settings.getScripts(editor);
  if (prefixes) {
    for (let i = 0; i < prefixes.length; i++) {
      if (src.indexOf(prefixes[i].filter) !== -1) {
        return prefixes[i];
      }
    }
  }
};

export default {
  getVideoScriptMatch
};