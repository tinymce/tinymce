/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';
import * as Options from './Options';

const register = (editor: Editor): void => {
  editor.addCommand('mceInsertDate', (_ui, value) => {
    Actions.insertDateTime(editor, value ?? Options.getDateFormat(editor));
  });

  editor.addCommand('mceInsertTime', (_ui, value) => {
    Actions.insertDateTime(editor, value ?? Options.getTimeFormat(editor));
  });
};

export {
  register
};
