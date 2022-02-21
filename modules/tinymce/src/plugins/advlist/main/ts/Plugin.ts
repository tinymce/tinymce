import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('advlist', (editor) => {
    if (editor.hasPlugin('lists')) {
      Options.register(editor);
      Buttons.register(editor);
      Commands.register(editor);
    } else {
      // eslint-disable-next-line no-console
      console.error('Please use the Lists plugin together with the Advanced List plugin.');
    }
  });
};
