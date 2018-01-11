/**
 * ResolveName.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import FilterContent from './FilterContent';

const setup = function (editor) {
  editor.on('ResolveName', function (e) {
    if (e.target.nodeName === 'IMG' && editor.dom.hasClass(e.target, FilterContent.getPageBreakClass())) {
      e.name = 'pagebreak';
    }
  });
};

export default {
  setup
};