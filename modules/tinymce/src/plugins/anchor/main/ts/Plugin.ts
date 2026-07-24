import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as Formats from './core/Formats';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'anchor';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    Options.register(editor);
    FilterContent.setup(editor);
    Commands.register(editor);
    Buttons.register(editor);

    editor.on('PreInit', () => {
      Formats.registerFormats(editor);
    });

    return {
      getMetadata: () => ({ name: 'Anchor', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
