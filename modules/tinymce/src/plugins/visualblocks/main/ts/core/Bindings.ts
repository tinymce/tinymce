import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';
import * as VisualBlocks from './VisualBlocks';

const setup = (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>): void => {
  // Prevents the visualblocks from being presented in the preview of formats when that is computed
  editor.on('PreviewFormats AfterPreviewFormats', (e) => {
    if (enabledState.get()) {
      editor.dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type === 'afterpreviewformats');
    }
  });

  editor.on('init', () => {
    if (Options.isEnabledByDefault(editor)) {
      VisualBlocks.toggleVisualBlocks(editor, pluginUrl, enabledState);
    }
  });
};

export {
  setup
};
