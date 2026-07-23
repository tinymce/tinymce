import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'insertdatetime';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);

    return {
      getMetadata: () => ({ name: 'Insert Date/Time', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
