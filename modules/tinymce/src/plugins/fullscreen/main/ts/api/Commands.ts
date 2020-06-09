/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from '../core/Actions';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor, fullscreenState: Cell<any>) => {
  editor.addCommand('mceFullScreen', () => {
    Actions.toggleFullscreen(editor, fullscreenState);
  });
};

export {
  register
};
