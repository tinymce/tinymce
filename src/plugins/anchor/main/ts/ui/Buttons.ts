/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('anchor', {
    icon: 'anchor',
    tooltip: 'Anchor',
    cmd: 'mceAnchor',
    stateSelector: 'a:not([href])'
  });

  editor.addMenuItem('anchor', {
    icon: 'anchor',
    text: 'Anchor',
    context: 'insert',
    cmd: 'mceAnchor'
  });
};

export default {
  register
};