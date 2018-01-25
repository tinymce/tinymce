/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const generateSelector = function (dir) {
  const selector = [];

  Tools.each('h1 h2 h3 h4 h5 h6 div p'.split(' '), function (name) {
    selector.push(name + '[dir=' + dir + ']');
  });

  return selector.join(',');
};

const register = function (editor) {
  editor.addButton('ltr', {
    title: 'Left to right',
    cmd: 'mceDirectionLTR',
    stateSelector: generateSelector('ltr')
  });

  editor.addButton('rtl', {
    title: 'Right to left',
    cmd: 'mceDirectionRTL',
    stateSelector: generateSelector('rtl')
  });
};

export default {
  register
};