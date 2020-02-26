/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Dialog from './Dialog';
import { SearchState } from '../core/Actions';

const showDialog = function (editor: Editor, currentSearchState: Cell<SearchState>) {
  return function () {
    Dialog.open(editor, currentSearchState);
  };
};

const register = function (editor: Editor, currentSearchState: Cell<SearchState>) {
  editor.ui.registry.addMenuItem('searchreplace', {
    text: 'Find and replace...',
    shortcut: 'Meta+F',
    onAction: showDialog(editor, currentSearchState),
    icon: 'search'
  });

  editor.ui.registry.addButton('searchreplace', {
    tooltip: 'Find and replace',
    onAction: showDialog(editor, currentSearchState),
    icon: 'search'
  });

  editor.shortcuts.add('Meta+F', '', showDialog(editor, currentSearchState));
};

export {
  register
};
