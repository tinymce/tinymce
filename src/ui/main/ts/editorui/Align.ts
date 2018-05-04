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
import * as FormatUtils from './FormatUtils';

const register = function (editor) {
  const alignFormats = [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ];
  const defaultAlign = 'alignleft';
  const alignMenuItems = [
    { text: 'Left', icon: 'alignleft', onclick: FormatUtils.toggleFormat(editor, 'alignleft') },
    { text: 'Center', icon: 'aligncenter', onclick: FormatUtils.toggleFormat(editor, 'aligncenter') },
    { text: 'Right', icon: 'alignright', onclick: FormatUtils.toggleFormat(editor, 'alignright') },
    { text: 'Justify', icon: 'alignjustify', onclick: FormatUtils.toggleFormat(editor, 'alignjustify') }
  ];

  editor.addMenuItem('align', {
    text: 'Align',
    menu: alignMenuItems
  });

  editor.addButton('align', {
    type: 'menubutton',
    icon: defaultAlign,
    menu: alignMenuItems,
    onShowMenu: (e) => {
      const menu = e.control.menu;

      Tools.each(alignFormats, (formatName, idx) => {
        menu.items().eq(idx).each((item) => item.active(editor.formatter.match(formatName)));
      });
    },
    onPostRender: (e) => {
      const ctrl = e.control;

      Tools.each(alignFormats, (formatName, idx) => {
        FormatUtils.addFormatChangedListener(editor, formatName, (state) => {
          ctrl.icon(defaultAlign);

          if (state) {
            ctrl.icon(formatName);
          }
        });
      });
    }
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
      onPostRender: FormatUtils.postRenderFormatToggle(editor, name)
    });
  });
};

export default {
  register
};