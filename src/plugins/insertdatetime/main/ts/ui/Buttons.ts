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
import Settings from '../api/Settings';
import Actions from '../core/Actions';

const createMenuItems = function (editor, lastFormatState) {
  const formats = Settings.getFormats(editor);

  return Tools.map(formats, function (fmt) {
    return {
      text: Actions.getDateTime(editor, fmt),
      onclick () {
        lastFormatState.set(fmt);
        Actions.insertDateTime(editor, fmt);
      }
    };
  });
};

const register = function (editor, lastFormatState) {
  const menuItems = createMenuItems(editor, lastFormatState);

  editor.addButton('insertdatetime', {
    type: 'splitbutton',
    title: 'Insert date/time',
    menu: menuItems,
    onclick () {
      const lastFormat = lastFormatState.get();
      Actions.insertDateTime(editor, lastFormat ? lastFormat : Settings.getDefaultDateTime(editor));
    }
  });

  editor.addMenuItem('insertdatetime', {
    icon: 'date',
    text: 'Date/time',
    menu: menuItems,
    context: 'insert'
  });
};

export default {
  register
};