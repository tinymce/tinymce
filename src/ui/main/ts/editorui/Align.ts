/**
 * Align.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';
import FormatUtils from './FormatUtils';

const register = function (editor) {
  editor.addMenuItem('align', {
    text: 'Align',
    menu: [
      { text: 'Left', icon: 'alignleft', onclick: FormatUtils.toggleFormat(editor, 'alignleft') },
      { text: 'Center', icon: 'aligncenter', onclick: FormatUtils.toggleFormat(editor, 'aligncenter') },
      { text: 'Right', icon: 'alignright', onclick: FormatUtils.toggleFormat(editor, 'alignright') },
      { text: 'Justify', icon: 'alignjustify', onclick: FormatUtils.toggleFormat(editor, 'alignjustify') }
    ]
  });

  Tools.each({
    alignleft: ['Align left', 'JustifyLeft'],
    aligncenter: ['Align center', 'JustifyCenter'],
    alignright: ['Align right', 'JustifyRight'],
    alignjustify: ['Justify', 'JustifyFull'],
    alignnone: ['No alignment', 'JustifyNone']
  }, function (item, name) {
    editor.addButton(name, {
      active: false,
      tooltip: item[0],
      cmd: item[1],
      onPostRender: FormatUtils.postRenderFormat(editor, name)
    });
  });
};

export default {
  register
};