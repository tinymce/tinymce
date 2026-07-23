import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Options from './api/Options';
import * as ImportCss from './core/ImportCss';

const PLUGIN_CODE = 'importcss';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    ImportCss.setup(editor);
    return {
      ...Api.get(editor),
      getMetadata: () => ({ name: 'Import CSS', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
