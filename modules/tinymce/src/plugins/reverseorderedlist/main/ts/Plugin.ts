import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as ListReversal from './core/ListReversal';
import * as Buttons from './ui/Buttons';

const setup = (editor: Editor) => {
  const reverser = ListReversal.setup(editor);
  Commands.register(editor, reverser);
  Buttons.register(editor, reverser);
};

export default (): void => {
  PluginManager.add('reverseorderedlist', setup);
};
