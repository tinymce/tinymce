import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';

const toggleVisualBlocks = (editor: Editor, pluginUrl: string, enabledState: Cell<boolean>): void => {
  const dom = editor.dom;

  dom.toggleClass(editor.getBody(), 'mce-visualblocks');
  enabledState.set(!enabledState.get());

  Events.fireVisualBlocks(editor, enabledState.get());
};

export {
  toggleVisualBlocks
};
