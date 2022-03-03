import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as FilterContent from './core/FilterContent';
import * as ResolveName from './core/ResolveName';
import * as Selection from './core/Selection';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('media', (editor) => {
    Options.register(editor);
    Commands.register(editor);
    Buttons.register(editor);
    ResolveName.setup(editor);
    FilterContent.setup(editor);
    Selection.setup(editor);
    return Api.get(editor);
  });
};
