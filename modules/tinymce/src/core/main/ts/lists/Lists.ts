
import Editor from '../api/Editor';
import * as Options from '../api/Options';

import * as Commands from './lists/Commands';
import * as Delete from './lists/Delete';
import * as FilterContent from './lists/FilterContent';
import * as Keyboard from './lists/Keyboard';

const setup = (editor: Editor): void => {
  if (Options.shouldHaveListFeatures(editor)) {
    Delete.setup(editor);
    Commands.setup(editor);
    FilterContent.setup(editor);
    Keyboard.setup(editor);
  }
};

export {
  setup
};
