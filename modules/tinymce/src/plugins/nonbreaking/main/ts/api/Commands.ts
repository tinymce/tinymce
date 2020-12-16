/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from '../core/Actions';

const register = (editor) => {
  editor.addCommand('mceNonBreaking', () => {
    Actions.insertNbsp(editor, 1);
  });
};

export {
  register
};
