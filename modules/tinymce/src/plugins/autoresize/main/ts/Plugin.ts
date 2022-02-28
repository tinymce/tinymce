import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Resize from './core/Resize';

/**
 * This class contains all core logic for the autoresize plugin.
 *
 * @class tinymce.autoresize.Plugin
 * @private
 */

export default (): void => {
  PluginManager.add('autoresize', (editor) => {
    Options.register(editor);
    // If autoresize is enabled, disable resize if the user hasn't explicitly enabled it
    // TINY-8288: This currently does nothing because of a bug in the theme
    if (!editor.options.isSet('resize')) {
      editor.options.set('resize', false);
    }
    if (!editor.inline) {
      const oldSize = Cell(0);
      Commands.register(editor, oldSize);
      Resize.setup(editor, oldSize);
    }
  });
};
