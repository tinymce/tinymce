import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as CharMap from './core/CharMap';
import * as Autocompletion from './ui/Autocompletion';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('charmap', (editor) => {
    Options.register(editor);
    const charMap = CharMap.getCharMap(editor);
    Commands.register(editor, charMap);
    Buttons.register(editor);

    Autocompletion.init(editor, charMap[0]);

    return Api.get(editor);
  });
};
