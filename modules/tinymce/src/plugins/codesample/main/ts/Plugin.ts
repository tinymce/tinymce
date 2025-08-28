import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as Buttons from './ui/Buttons';
import * as Dialog from './ui/Dialog';
import * as Utils from './util/Utils';

export default (): void => {
  PluginManager.add('codesample', (editor) => {
    Options.register(editor);
    FilterContent.setup(editor);
    Buttons.register(editor);
    Commands.register(editor);

    editor.on('dblclick', (ev) => {
      if (Utils.isCodeSample(ev.target)) {
        Dialog.open(editor);
      }
    });
  });
};
