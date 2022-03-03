import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Events from '../api/Events';
import * as VisualChars from './VisualChars';

const applyVisualChars = (editor: Editor, toggleState: Cell<boolean>): void => {
  Events.fireVisualChars(editor, toggleState.get());

  const body = editor.getBody();
  if (toggleState.get() === true) {
    VisualChars.show(editor, body);
  } else {
    VisualChars.hide(editor, body);
  }
};

// Toggle state and save selection bookmark before applying visualChars
const toggleVisualChars = (editor: Editor, toggleState: Cell<boolean>): void => {
  toggleState.set(!toggleState.get());

  const bookmark = editor.selection.getBookmark();
  applyVisualChars(editor, toggleState);
  editor.selection.moveToBookmark(bookmark);
};

export {
  applyVisualChars,
  toggleVisualChars
};
