/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Events from '../api/Events';
import * as VisualChars from './VisualChars';

const toggleVisualChars = function (editor, toggleState) {
  const body = editor.getBody();
  const selection = editor.selection;

  toggleState.set(!toggleState.get());
  Events.fireVisualChars(editor, toggleState.get());

  const bookmark = selection.getBookmark();

  if (toggleState.get() === true) {
    VisualChars.show(editor, body);
  } else {
    VisualChars.hide(editor, body);
  }

  selection.moveToBookmark(bookmark);
};

export {
  toggleVisualChars
};
