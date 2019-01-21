/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('formula', {
    tooltip: 'Variable',
    cmd: 'mceShowVariables'
  });

  editor.addMenuItem('formula', {
    text: 'Variable',
    cmd: 'mceShowVariables',
    context: 'insert'
  });
};

export default {
  register
};