import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { getNewlineBehavior } from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import { execDeleteCommand } from '../delete/DeleteUtils';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import { blockbreak } from './InsertBlock';
import { linebreak } from './InsertBr';
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
  const br = () => insertBreak(linebreak, editor, evt);
  const block = () => insertBreak(blockbreak, editor, evt);

  const logicalAction = NewLineAction.getAction(editor, evt);

  switch (getNewlineBehavior(editor)) {
    case 'linebreak':
      logicalAction.fold(br, br, Fun.noop);
      break;
    case 'block':
      logicalAction.fold(block, block, Fun.noop);
      break;
    case 'invert':
      logicalAction.fold(block, br, Fun.noop);
      break;
    // implied by the options processor, unnecessary
    // case 'default':
    default:
      logicalAction.fold(br, block, Fun.noop);
      break;
  }
};

export {
  insert,
  insertBreak
};
