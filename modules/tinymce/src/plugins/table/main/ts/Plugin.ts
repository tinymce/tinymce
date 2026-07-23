import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { getSelectionTargets } from './selection/SelectionTargets';
import * as Buttons from './ui/Buttons';
import * as MenuItems from './ui/MenuItems';

const PLUGIN_CODE = 'table';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    const selectionTargets = getSelectionTargets(editor);

    Options.register(editor);
    Commands.registerCommands(editor);

    MenuItems.addMenuItems(editor, selectionTargets);
    Buttons.addButtons(editor, selectionTargets);
    Buttons.addToolbars(editor);

    return {
      getMetadata: () => ({ name: 'Table', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
