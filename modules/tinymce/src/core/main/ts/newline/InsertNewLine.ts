import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { getKeyboardEnterBehavior } from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import { execDeleteCommand } from '../delete/DeleteUtils';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  const lineBreak = () => {
    if (!editor.selection.isCollapsed()) {
      execDeleteCommand(editor);
    }
    if (Type.isNonNullable(evt)) {
      const event = fireFakeBeforeInputEvent(editor, 'insertLineBreak');
      if (event.isDefaultPrevented()) {
        return;
      }
    }

    InsertBr.insert(editor, evt);

    if (Type.isNonNullable(evt)) {
      fireFakeInputEvent(editor, 'insertLineBreak');
    }
  };
  const blockBreak = () => {
    if (!editor.selection.isCollapsed()) {
      execDeleteCommand(editor);
    }
    if (Type.isNonNullable(evt)) {
      const event = fireFakeBeforeInputEvent(editor, 'insertParagraph');
      if (event.isDefaultPrevented()) {
        return;
      }
    }

    InsertBlock.insert(editor, evt);

    if (Type.isNonNullable(evt)) {
      fireFakeInputEvent(editor, 'insertParagraph');
    }
  };

  switch (getKeyboardEnterBehavior(editor)) {
    case 'linebreak':
      lineBreak();
      break;
    case 'block':
      blockBreak();
      break;
    case 'invert':
      NewLineAction.getAction(editor, evt).fold(
        blockBreak,
        lineBreak,
        Fun.noop
      );
      break;
    // implied by the options processor, unnecessary
    // case 'default':
    default:
      NewLineAction.getAction(editor, evt).fold(
        lineBreak,
        blockBreak,
        Fun.noop
      );
  }
};

export {
  insert
};
