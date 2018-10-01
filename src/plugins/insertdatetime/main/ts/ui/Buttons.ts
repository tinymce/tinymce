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
import { Cell } from '@ephox/katamari';

const register = function (editor) {
  const formats = Settings.getFormats(editor);
  const defaultFormat = Cell(Settings.getDefaultDateTime(editor));

  editor.ui.registry.addSplitButton('insertdatetime', {
    type: 'splitbutton',
    icon: 'insert-time',
    tooltip: 'Insert date/time',
    fetch: (done) => {
      done(Tools.map(formats, (format) => ({type: 'choiceitem', text: Actions.getDateTime(editor, format), value: format})));
    },
    onAction: (...args) => {
      Actions.insertDateTime(editor, defaultFormat.get());
    },
    onItemAction: (_ , value) => {
      defaultFormat.set(value);
      Actions.insertDateTime(editor, value);
    }
  });

  const makeMenuItemHandler = (format) => () => {
    defaultFormat.set(format);
    Actions.insertDateTime(editor, format);
  };

  editor.ui.registry.addMenuItem('insertdatetime', {
    icon: 'insert-time',
    text: 'Date/time',
    getSubmenuItems: () => Tools.map(formats, (format) => ({type: 'menuitem', text: Actions.getDateTime(editor, format), onAction: makeMenuItemHandler(format)}))
  });
};

export default {
  register
};