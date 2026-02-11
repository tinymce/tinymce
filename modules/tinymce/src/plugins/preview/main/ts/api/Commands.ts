import type Editor from 'tinymce/core/api/Editor';

import type { ContentCssResource } from '../core/Types';
import { open } from '../ui/Dialog';

const register = (editor: Editor, getContentCssResources: () => ContentCssResource[]): void => {
  editor.addCommand('mcePreview', () => {
    open(editor, getContentCssResources());
  });
};

export {
  register
};
