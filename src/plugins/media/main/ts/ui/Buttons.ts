/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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