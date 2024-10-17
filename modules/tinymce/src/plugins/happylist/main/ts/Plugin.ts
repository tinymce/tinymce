import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';

const setup = (editor: Editor) => {
  Options.register(editor);
  Commands.register(editor);
  Buttons.register(editor);
};

export default (): void => {
  PluginManager.add('happylist', setup);
};
