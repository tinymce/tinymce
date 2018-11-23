/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('pagebreak', {
    title: 'Page break',
    cmd: 'mcePageBreak'
  });

  editor.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'pagebreak',
    cmd: 'mcePageBreak',
    context: 'insert'
  });
};

export default {
  register
};