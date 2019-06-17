/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import AlignmentButtons from './AlignmentButtons';
import SimpleControls from './SimpleControls';
import UndoRedo from './UndoRedo';
import VisualAid from './VisualAid';
import ColorSwatch from './color/ColorSwatch';
import Editor from 'tinymce/core/api/Editor';
import IndentOutdent from './IndentOutdent';
import ComplexControls from './ComplexControls';
import { UiFactoryBackstage } from '../../backstage/Backstage';

const setup = (editor: Editor, backstage: UiFactoryBackstage) => {
  AlignmentButtons.register(editor);
  SimpleControls.register(editor);
  ComplexControls.register(editor, backstage);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
  IndentOutdent.register(editor);
};

export default {
  setup
};