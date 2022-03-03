import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { SearchState } from '../core/Actions';
import * as Dialog from './Dialog';

const showDialog = (editor: Editor, currentSearchState: Cell<SearchState>) => (): void => {
  Dialog.open(editor, currentSearchState);
};

const register = (editor: Editor, currentSearchState: Cell<SearchState>): void => {
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
