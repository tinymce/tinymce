/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent, console } from '@ephox/dom-globals';
import InsertNewLine from '../newline/InsertNewLine';
import VK from '../api/util/VK';
import Editor from '../api/Editor';
import UndoManager from '../api/UndoManager';
import { EditorEvent } from '../api/util/EventDispatcher';
import { PlatformDetection } from '@ephox/sand';

const browser = PlatformDetection.detect().browser;

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

const handleEnter = function (editor: Editor) {
  return function (event: EditorEvent<KeyboardEvent>) {
    if (event.keyCode === VK.ENTER) {
      handleEnterKeyEvent(editor, event);
    }
  };
};

const setup = function (editor: Editor) {
  if (browser.isSafari()) {
    editor.getBody().addEventListener('beforeinput', handleEnter(editor));
    editor.on('remove', function () {
      editor.getBody().removeEventListener('beforeinput', handleEnter(editor));
    });
  } else {
    editor.on('keydown', handleEnter(editor));
  }
};

export default {
  setup
};