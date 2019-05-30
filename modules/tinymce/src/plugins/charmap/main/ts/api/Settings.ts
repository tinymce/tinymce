/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getCharMap = function (editor) {
  return editor.settings.charmap;
};

const getCharMapAppend = function (editor) {
  return editor.settings.charmap_append;
};

export default {
  getCharMap,
  getCharMapAppend
};