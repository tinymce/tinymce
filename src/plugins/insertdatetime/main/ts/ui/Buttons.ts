/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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