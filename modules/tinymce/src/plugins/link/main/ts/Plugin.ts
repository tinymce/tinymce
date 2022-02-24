import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Actions from './core/Actions';
import * as Keyboard from './core/Keyboard';
import * as Controls from './ui/Controls';

export default (): void => {
  PluginManager.add('link', (editor) => {
    Options.register(editor);
    Controls.setupButtons(editor);
    Controls.setupMenuItems(editor);
    Controls.setupContextMenu(editor);
    Controls.setupContextToolbars(editor);
    Actions.setupGotoLinks(editor);
    Commands.register(editor);
    Keyboard.setup(editor);
  });
};
