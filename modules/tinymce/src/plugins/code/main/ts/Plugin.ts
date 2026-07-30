import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'code';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Commands.register(editor);
    Buttons.register(editor);

    return {
      getMetadata: () => ({ name: 'Code', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
