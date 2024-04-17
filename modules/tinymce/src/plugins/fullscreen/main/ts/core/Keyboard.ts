import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { FullScreenInfo } from './Actions';

const setup = (editor: Editor, fullscreenState: Cell<FullScreenInfo | null>): void => {
  editor.on('init', () => {
    editor.on('keydown', (e) => {
      if (e.key === 'Tab' && fullscreenState.get()) {
        e.preventDefault();
      }
    });
  });
};

export {
  setup
};

