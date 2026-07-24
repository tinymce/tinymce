import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import type { SearchState } from './core/Actions';
import * as Buttons from './ui/Buttons';

const PLUGIN_CODE = 'searchreplace';

export default (): void => {
  PluginManager.add(PLUGIN_CODE, (editor) => {
    const currentSearchState = Cell<SearchState>({
      index: -1,
      count: 0,
      text: '',
      matchCase: false,
      wholeWord: false,
      inSelection: false
    });

    Commands.register(editor, currentSearchState);
    Buttons.register(editor, currentSearchState);

    return {
      ...Api.get(editor, currentSearchState),
      getMetadata: () => ({ name: 'Search and Replace', type: 'opensource', slug: PLUGIN_CODE })
    };
  });
};
