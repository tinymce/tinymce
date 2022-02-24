import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Wordcounter from './core/WordCounter';
import * as Buttons from './ui/Buttons';

export default (delay: number = 300): void => {
  PluginManager.add('wordcount', (editor) => {
    const api = Api.get(editor);

    Commands.register(editor, api);
    Buttons.register(editor);
    Wordcounter.setup(editor, api, delay);
    return api;
  });
};
