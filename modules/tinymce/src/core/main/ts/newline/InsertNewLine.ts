import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { getNewlineBehavior } from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import { execDeleteCommand } from '../delete/DeleteUtils';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insertBreak = (breakType: {
  insert: (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => void;
  fakeEventName: string;
}, editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  if (!editor.selection.isCollapsed()) {
    execDeleteCommand(editor);
  }
  if (Type.isNonNullable(evt)) {
    const event = fireFakeBeforeInputEvent(editor, breakType.fakeEventName);
    if (event.isDefaultPrevented()) {
      return;
    }
  }

  breakType.insert(editor, evt);

  if (Type.isNonNullable(evt)) {
    fireFakeInputEvent(editor, breakType.fakeEventName);
  }
};

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  const lineBreak = () => insertBreak(InsertBr, editor, evt);
  const blockBreak = () => insertBreak(InsertBlock, editor, evt);

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
  insert,
  insertBreak
};
