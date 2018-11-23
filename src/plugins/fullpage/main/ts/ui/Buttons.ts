/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('fullpage', {
    title: 'Document properties',
    cmd: 'mceFullPageProperties'
  });

  editor.addMenuItem('fullpage', {
    text: 'Document properties',
    cmd: 'mceFullPageProperties',
    context: 'file'
  });
};

export default {
  register
};