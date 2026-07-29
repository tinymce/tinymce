import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as CharMap from './core/CharMap';
import * as Autocompletion from './ui/Autocompletion';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'charmap';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    const charMap = CharMap.getCharMap(editor);
    Commands.register(editor, charMap);
    Buttons.register(editor);

    Autocompletion.init(editor, charMap[0]);

    return {
      ...Api.get(editor),
      getMetadata: () => ({ name: 'Character Map', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
