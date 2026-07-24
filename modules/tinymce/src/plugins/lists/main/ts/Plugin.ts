import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const PLUGIN_CODE = 'lists';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Commands.register(editor);
    Buttons.register(editor);
    MenuItems.register(editor);

    return {
      ...Api.get(editor),
      getMetadata: () => ({ name: 'Lists', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
