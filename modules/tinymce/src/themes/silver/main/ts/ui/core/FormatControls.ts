/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import * as AlignmentButtons from './AlignmentButtons';
import * as ColorSwatch from './color/ColorSwatch';
import * as ComplexControls from './ComplexControls';
import * as IndentOutdent from './IndentOutdent';
import * as LineHeight from './LineHeight';
import * as SimpleControls from './SimpleControls';
import * as UndoRedo from './UndoRedo';
import * as VisualAid from './VisualAid';

const setup = (editor: Editor, backstage: UiFactoryBackstage) => {
  AlignmentButtons.register(editor);
  SimpleControls.register(editor);
  ComplexControls.register(editor, backstage);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
  IndentOutdent.register(editor);
  LineHeight.register(editor);
};

export {
  setup
};
