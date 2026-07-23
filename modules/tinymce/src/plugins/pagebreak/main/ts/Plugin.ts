import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as ResolveName from './core/ResolveName';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'pagebreak';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);
    FilterContent.setup(editor);
    ResolveName.setup(editor);

    return {
      getMetadata: () => ({ name: 'Page Break', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
