import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import * as AlignmentButtons from './AlignmentButtons';
import * as ChoiceControls from './ChoiceControls';
import * as ColorSwatch from './color/ColorSwatch';
import * as ComplexControls from './ComplexControls';
import * as IndentOutdent from './IndentOutdent';
import * as PasteControls from './PasteControls';
import * as SimpleControls from './SimpleControls';
import * as UndoRedo from './UndoRedo';
import * as VisualAid from './VisualAid';

const setup = (editor: Editor, backstage: UiFactoryBackstage): void => {
  AlignmentButtons.register(editor);
  SimpleControls.register(editor);
  ComplexControls.register(editor, backstage);
  UndoRedo.register(editor);
  ColorSwatch.register(editor);
  VisualAid.register(editor);
  IndentOutdent.register(editor);
  ChoiceControls.register(editor);
  PasteControls.register(editor);
};

export {
  setup
};
