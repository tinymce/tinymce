import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from './FakeInputEvents';
import * as InsertSpace from './InsertSpace';
import * as MatchKeys from './MatchKeys';

const executeKeydownOverride = (editor: Editor, evt: KeyboardEvent) => {
  MatchKeys.executeWithDelayedAction([
    { keyCode: VK.SPACEBAR, action: MatchKeys.action(InsertSpace.insertSpaceOrNbspAtSelection, editor) }
  ], evt).each((applyAction) => {
    evt.preventDefault();
    const event = fireFakeBeforeInputEvent(editor, 'insertText', { data: ' ' });

    if (!event.isDefaultPrevented()) {
      applyAction();
      // Browsers sends space in data even if the dom ends up with a nbsp so we should always be sending a space
      fireFakeInputEvent(editor, 'insertText', { data: ' ' });
    }
  });
};

const setup = (editor: Editor): void => {
  editor.on('keydown', (evt: EditorEvent<KeyboardEvent>) => {
    if (!evt.isDefaultPrevented()) {
      executeKeydownOverride(editor, evt);
    }
  });
};

export {
  setup
};
