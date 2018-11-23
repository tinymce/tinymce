/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const register = function (editor) {
  editor.addButton('media', {
    tooltip: 'Insert/edit media',
    cmd: 'mceMedia',
    stateSelector: ['img[data-mce-object]', 'span[data-mce-object]', 'div[data-ephox-embed-iri]']
  });

  editor.addMenuItem('media', {
    icon: 'media',
    text: 'Media',
    cmd: 'mceMedia',
    context: 'insert',
    prependToContext: true
  });
};

export default {
  register
};