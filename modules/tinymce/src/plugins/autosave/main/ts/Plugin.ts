import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Options from './api/Options';
import * as BeforeUnload from './core/BeforeUnload';
import * as Storage from './core/Storage';
import * as Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the autosave plugin.
 *
 * @class tinymce.autosave.Plugin
 * @private
 */

export default (): void => {
  PluginManager.add('autosave', (editor) => {
    Options.register(editor);
    BeforeUnload.setup(editor);
    Buttons.register(editor);

    editor.on('init', () => {
      if (Options.shouldRestoreWhenEmpty(editor) && editor.dom.isEmpty(editor.getBody())) {
        Storage.restoreDraft(editor);
      }
    });

    return Api.get(editor);
  });
};
