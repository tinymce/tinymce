import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Bindings from './core/Bindings';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'visualblocks';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor, pluginUrl) => {
    Options.register(editor);

    const enabledState = Cell(false);
    Commands.register(editor, pluginUrl, enabledState);
    Buttons.register(editor, enabledState);
    Bindings.setup(editor, pluginUrl, enabledState);

    return {
      getMetadata: () => ({ name: 'Visual Blocks', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
