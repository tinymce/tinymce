/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('rotateleft', {
    title: 'Rotate counterclockwise',
    cmd: 'mceImageRotateLeft'
  });

  editor.addButton('rotateright', {
    title: 'Rotate clockwise',
    cmd: 'mceImageRotateRight'
  });

  editor.addButton('flipv', {
    title: 'Flip vertically',
    cmd: 'mceImageFlipVertical'
  });

  editor.addButton('fliph', {
    title: 'Flip horizontally',
    cmd: 'mceImageFlipHorizontal'
  });

  editor.addButton('editimage', {
    title: 'Edit image',
    cmd: 'mceEditImage'
  });

  editor.addButton('imageoptions', {
    title: 'Image options',
    icon: 'options',
    cmd: 'mceImage'
  });
};

export default {
  register
};