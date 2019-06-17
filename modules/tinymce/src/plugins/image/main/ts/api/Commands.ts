/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Dialog } from '../ui/Dialog';
import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor) => {
  editor.addCommand('mceImage', Dialog(editor).open);
};

export default {
  register
};