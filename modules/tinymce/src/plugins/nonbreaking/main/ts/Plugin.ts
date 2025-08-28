import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Keyboard from './core/Keyboard';
import * as Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the nonbreaking plugin.
 *
 * @class tinymce.nonbreaking.Plugin
 * @private
 */

export default (): void => {
  PluginManager.add('nonbreaking', (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);
    Keyboard.setup(editor);
  });
};
