import { Fun, Type } from '@ephox/katamari';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from '../keyboard/FakeInputEvents';
import * as InsertBlock from './InsertBlock';
import * as InsertBr from './InsertBr';
import * as NewLineAction from './NewLineAction';

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>) => {
  NewLineAction.getAction(editor, evt).fold(
    () => {
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
    },
    () => {
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
    },
    Fun.noop
  );
};

export {
  insert
};
