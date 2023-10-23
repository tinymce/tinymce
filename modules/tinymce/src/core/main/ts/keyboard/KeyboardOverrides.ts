import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as CaretContainerInput from '../caret/CaretContainerInput';
import * as Rtc from '../Rtc';
import * as ArrowKeys from './ArrowKeys';
import * as Autocompleter from './Autocompleter';
import * as BoundarySelection from './BoundarySelection';
import * as DeleteBackspaceKeys from './DeleteBackspaceKeys';
import * as EnterKey from './EnterKey';
import * as HomeEndKeys from './HomeEndKeys';
import * as InputKeys from './InputKeys';
import * as PageUpDownKeys from './PageUpDownKeys';
import * as PreventNoneditableInput from './PreventNoneditableInput';
import * as SpaceKey from './SpaceKey';
import * as TabKey from './TabKey';

const setup = (editor: Editor): Cell<Text | null> => {
  editor.addShortcut('Meta+P', '', 'mcePrint');
  Autocompleter.setup(editor);

  if (Rtc.isRtc(editor)) {
    return Cell<Text | null>(null);
  } else {
    const caret = BoundarySelection.setupSelectedState(editor);

    PreventNoneditableInput.setup(editor);
    CaretContainerInput.setup(editor);
    ArrowKeys.setup(editor, caret);
    DeleteBackspaceKeys.setup(editor, caret);
    EnterKey.setup(editor);
    SpaceKey.setup(editor);
    InputKeys.setup(editor);
    TabKey.setup(editor);
    HomeEndKeys.setup(editor, caret);
    PageUpDownKeys.setup(editor, caret);

    return caret;
  }
};

export {
  setup
};
