import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { getNewlineBehavior } from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import { execDeleteCommand } from '../delete/DeleteUtils';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  const insertBreak = (breakType: (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => void, fakeEvent: string) => () => {
    if (!editor.selection.isCollapsed()) {
      execDeleteCommand(editor);
    }
    if (Type.isNonNullable(evt)) {
      const event = fireFakeBeforeInputEvent(editor, fakeEvent);
      if (event.isDefaultPrevented()) {
        return;
      }
    }

    breakType(editor, evt);

    if (Type.isNonNullable(evt)) {
      fireFakeInputEvent(editor, fakeEvent);
    }
  };

  const lineBreak = insertBreak(InsertBr.insert, 'insertLineBreak');

  const blockBreak = insertBreak(InsertBlock.insert, 'insertParagraph');

  const logicalAction = NewLineAction.getAction(editor, evt);

  switch (getNewlineBehavior(editor)) {
    case 'linebreak':
      logicalAction.fold(lineBreak, lineBreak, Fun.noop);
      break;
    case 'block':
      logicalAction.fold(blockBreak, blockBreak, Fun.noop);
      break;
    case 'invert':
      logicalAction.fold(blockBreak, lineBreak, Fun.noop);
      break;
    // implied by the options processor, unnecessary
    // case 'default':
    default:
      logicalAction.fold(lineBreak, blockBreak, Fun.noop);
      break;
  }
};

export {
  insert
};
