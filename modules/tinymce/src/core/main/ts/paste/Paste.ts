import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as Clipboard from './Clipboard';
import * as Commands from './Commands';
import * as CutCopy from './CutCopy';
import * as DragDrop from './DragDrop';
import { PasteBin } from './PasteBin';
import * as PrePostProcess from './PrePostProcess';
import * as Quirks from './Quirks';

const setup = (editor: Editor): void => {
  const draggingInternallyState = Cell(false);
  const pasteFormat = Cell(Options.isPasteAsTextEnabled(editor) ? 'text' : 'html');
  const pasteBin = PasteBin(editor);

  Quirks.setup(editor);
  Commands.register(editor, pasteFormat);
  PrePostProcess.setup(editor);

  // IMPORTANT: The following event hooks need to be setup later so that other things
  // can hook in and prevent the event so core paste doesn't handle them.
  editor.on('PreInit', () => {
    CutCopy.register(editor);
    DragDrop.setup(editor, draggingInternallyState);
    Clipboard.registerEventsAndFilters(editor, pasteBin, pasteFormat);
  });
};

export {
  setup
};
