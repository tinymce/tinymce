import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor, fullscreenState: Cell<Actions.ScrollInfo | null>): void => {
  editor.addCommand('mceFullScreen', () => {
    Actions.toggleFullscreen(editor, fullscreenState);
  });
};

export {
  register
};
