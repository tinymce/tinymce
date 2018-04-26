/**
 * KeyboardOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import ArrowKeys from './ArrowKeys';
import BoundarySelection from './BoundarySelection';
import DeleteBackspaceKeys from './DeleteBackspaceKeys';
import EnterKey from './EnterKey';
import SpaceKey from './SpaceKey';
import CaretContainerInput from 'tinymce/core/caret/CaretContainerInput';
import { Editor } from 'tinymce/core/api/Editor';

const setup = function (editor: Editor) {
  const caret = BoundarySelection.setupSelectedState(editor);

  CaretContainerInput.setup(editor);
  ArrowKeys.setup(editor, caret);
  DeleteBackspaceKeys.setup(editor, caret);
  EnterKey.setup(editor);
  SpaceKey.setup(editor);
};

export default {
  setup
};