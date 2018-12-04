/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Align from './Align';
import SimpleControls from './SimpleControls';
import UndoRedo from './UndoRedo';
import VisualAid from './VisualAid';
import ColorSwatch from './color/ColorSwatch';
import { Editor } from 'tinymce/core/api/Editor';
import IndentOutdent from './IndentOutdent';

const setup = (editor: Editor) => {
  Align.register(editor);
  SimpleControls.register(editor);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
  IndentOutdent.register(editor);
};

export default {
  setup
};