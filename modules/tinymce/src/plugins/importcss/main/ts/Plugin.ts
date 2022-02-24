import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Options from './api/Options';
import * as ImportCss from './core/ImportCss';

export default (): void => {
  PluginManager.add('importcss', (editor) => {
    Options.register(editor);
    ImportCss.setup(editor);
    return Api.get(editor);
  });
};
