import PluginManager from 'tinymce/core/api/PluginManager';

import * as Options from './api/Options';
import * as Keys from './core/Keys';

const PLUGIN_CODE = 'autolink';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    Keys.setup(editor);

    return {
      getMetadata: () => ({ name: 'Autolink', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
