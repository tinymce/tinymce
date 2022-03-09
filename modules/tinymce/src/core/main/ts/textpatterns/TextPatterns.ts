import Editor from '../api/Editor';
import * as Keyboard from './keyboard/Keyboard';

const setup = (editor: Editor): void => {
  Keyboard.setup(editor);
};

export {
  setup
};
