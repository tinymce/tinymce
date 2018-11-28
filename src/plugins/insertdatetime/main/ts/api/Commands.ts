/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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