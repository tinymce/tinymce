/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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