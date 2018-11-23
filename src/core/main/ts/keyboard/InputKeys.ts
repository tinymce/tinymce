/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from '../api/Editor';
import { normalizeNbspsInEditor } from './Nbsps';

const setup = (editor: Editor) => {
  editor.on('input', (e) => {
    // We only care about non composing inputs since moving the caret or modifying the text node will blow away the IME
    if (e.isComposing === false) {
      normalizeNbspsInEditor(editor);
    }
  });
};

export {
  setup
};