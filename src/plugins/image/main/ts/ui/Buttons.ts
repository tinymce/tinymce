/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';

const register = function (editor) {
  editor.addButton('image', {
    icon: 'image',
    tooltip: 'Insert/edit image',
    onclick: Dialog(editor).open,
    stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
  });

  editor.addMenuItem('image', {
    icon: 'image',
    text: 'Image',
    onclick: Dialog(editor).open,
    context: 'insert',
    prependToContext: true
  });
};

export default {
  register
};