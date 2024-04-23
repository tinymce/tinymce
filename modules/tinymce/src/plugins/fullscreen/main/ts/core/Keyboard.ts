import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import { FullScreenInfo } from './Actions';

const setup = (editor: Editor, fullscreenState: Cell<FullScreenInfo | null>): void => {
  editor.on('init', () => {
    editor.on('keydown', (e) => {
      if (e.keyCode === VK.TAB && !(e.metaKey || e.ctrlKey) && fullscreenState.get()) {
        e.preventDefault();
      }
    });
  });
};

export {
  setup
};

