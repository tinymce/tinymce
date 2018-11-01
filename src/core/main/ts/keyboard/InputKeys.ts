/**
 * InputKeys.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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