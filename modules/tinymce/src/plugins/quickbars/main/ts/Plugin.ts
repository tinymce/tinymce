import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as InsertButtons from './insert/Buttons';
import * as InsertToolbars from './insert/Toolbars';
import * as SelectionToolbars from './selection/Toolbars';

const PLUGIN_CODE = 'quickbars';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    Commands.register(editor);
    InsertButtons.setupButtons(editor);
    InsertToolbars.addToEditor(editor);

    SelectionToolbars.addToEditor(editor);

    return {
      getMetadata: () => ({ name: 'Quick Toolbars', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
