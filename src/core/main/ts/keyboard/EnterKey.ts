/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import InsertNewLine from '../newline/InsertNewLine';
import VK from '../api/util/VK';
import { Editor } from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/dom/EventUtils';
import { KeyboardEvent } from '@ephox/dom-globals';
import { UndoManager } from '../api/UndoManager';

const endTypingLevel = function (undoManager: UndoManager) {
  if (undoManager.typing) {
    undoManager.typing = false;
    undoManager.add();
  }
};

const handleEnterKeyEvent = function (editor: Editor, event: EditorEvent<KeyboardEvent>) {
  if (event.isDefaultPrevented()) {
    return;
  }

  event.preventDefault();

  endTypingLevel(editor.undoManager);
  editor.undoManager.transact(function () {
    if (editor.selection.isCollapsed() === false) {
      editor.execCommand('Delete');
    }

    InsertNewLine.insert(editor, event);
  });
};

const setup = function (editor: Editor) {
  editor.on('keydown', function (event: EditorEvent<KeyboardEvent>) {
    if (event.keyCode === VK.ENTER) {
      handleEnterKeyEvent(editor, event);
    }
  });
};

export default {
  setup
};