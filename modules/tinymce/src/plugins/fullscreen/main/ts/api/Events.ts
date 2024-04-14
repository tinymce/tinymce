import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import Delay from 'tinymce/core/api/util/Delay';

import * as Options from '../api/Options';
import * as Actions from '../core/Actions';

const fireFullscreenStateChanged = (editor: Editor, state: boolean): void => {
  editor.dispatch('FullscreenStateChanged', { state });
  editor.dispatch('ResizeEditor');
};

const setup = (editor: Editor, fullscreenState: Cell<Actions.FullScreenInfo | null>): void => {
  editor.on('blur', () => {
    if (fullscreenState.get() && Options.shouldFullScreenTrapFocus(editor)) {
      Delay.setEditorTimeout(editor, () => editor.focus());
    }
  });
};

export {
  fireFullscreenStateChanged,
  setup
};
