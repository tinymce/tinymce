import Align from './Align';
import SimpleControls from './SimpleControls';
import UndoRedo from './UndoRedo';
import VisualAid from './VisualAid';
import ColorSwatch from './color/ColorSwatch';

/**
 * FormatControls.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const setup = (editor) => {
  Align.register(editor);
  SimpleControls.register(editor);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
  // InsertButton.register(editor); // TODO AP-300
};

export default {
  setup
};