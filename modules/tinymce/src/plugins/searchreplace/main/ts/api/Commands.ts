import type { Cell } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import type { SearchState } from '../core/Actions';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor, currentSearchState: Cell<SearchState>): void => {
  editor.addCommand('SearchReplace', () => {
    Dialog.open(editor, currentSearchState);
  });
};

export {
  register
};
