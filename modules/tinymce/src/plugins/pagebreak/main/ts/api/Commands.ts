import Editor from 'tinymce/core/api/Editor';

import * as FilterContent from '../core/FilterContent';
import * as Options from './Options';

const register = (editor: Editor): void => {
  editor.addCommand('mcePageBreak', () => {
    editor.insertContent(FilterContent.getPlaceholderHtml(Options.shouldSplitBlock(editor)));
  });
};

export {
  register
};
