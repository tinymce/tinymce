import PluginManager from 'tinymce/core/api/PluginManager';

import * as Options from './api/Options';
import * as Keys from './core/Keys';

export default (): void => {
  PluginManager.add('autolink', (editor) => {
    Options.register(editor);
    Keys.setup(editor);
  });
};
