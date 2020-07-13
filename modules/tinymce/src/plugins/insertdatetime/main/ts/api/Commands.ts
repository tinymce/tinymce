/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Settings from './Settings';
import * as Actions from '../core/Actions';

const register = (editor: Editor) => {
  editor.addCommand('mceInsertDate', () => {
    Actions.insertDateTime(editor, editor.translate(Settings.getDateFormat(editor)));
  });

  editor.addCommand('mceInsertTime', () => {
    Actions.insertDateTime(editor, editor.translate(Settings.getTimeFormat(editor)));
  });
};

export {
  register
};
