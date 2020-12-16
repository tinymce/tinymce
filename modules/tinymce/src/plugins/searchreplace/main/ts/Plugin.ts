/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import * as Commands from './api/Commands';
import { SearchState } from './core/Actions';
import * as Buttons from './ui/Buttons';

export default () => {
  PluginManager.add('searchreplace', (editor) => {
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

    return Api.get(editor, currentSearchState);
  });
};
