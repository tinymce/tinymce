/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('preview', {
    title: 'Preview',
    cmd: 'mcePreview'
  });

  editor.addMenuItem('preview', {
    text: 'Preview',
    cmd: 'mcePreview',
    context: 'view'
  });
};

export default {
  register
};