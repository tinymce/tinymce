/**
 * FormatControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Align from './Align';
import SimpleControls from './SimpleControls';
import UndoRedo from './UndoRedo';
import VisualAid from './VisualAid';
import ColorSwatch from './color/ColorSwatch';
import { Editor } from 'tinymce/core/api/Editor';

const setup = (editor: Editor) => {
  Align.register(editor);
  SimpleControls.register(editor);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
};

export default {
  setup
};