/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Settings from './Settings';
import Actions from '../core/Actions';

const register = function (editor) {
  editor.addCommand('mceInsertDate', function () {
    Actions.insertDateTime(editor, Settings.getDateFormat(editor));
  });

  editor.addCommand('mceInsertTime', function () {
    Actions.insertDateTime(editor, Settings.getTimeFormat(editor));
  });
};

export default {
  register
};