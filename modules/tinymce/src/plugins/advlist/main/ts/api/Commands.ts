/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from '../core/Actions';

const register = (editor) => {
  editor.addCommand('ApplyUnorderedListStyle', (ui, value) => {
    Actions.applyListFormat(editor, 'UL', value['list-style-type']);
  });

  editor.addCommand('ApplyOrderedListStyle', (ui, value) => {
    Actions.applyListFormat(editor, 'OL', value['list-style-type']);
  });
};

export {
  register
};
