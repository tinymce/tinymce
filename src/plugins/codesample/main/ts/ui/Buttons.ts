/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('codesample', {
    cmd: 'codesample',
    title: 'Insert/Edit code sample'
  });

  editor.addMenuItem('codesample', {
    cmd: 'codesample',
    text: 'Code sample',
    icon: 'codesample'
  });
};

export default {
  register
};