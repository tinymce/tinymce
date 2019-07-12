/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { KeyboardEvent } from '@ephox/dom-globals';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import UndoManager from '../api/UndoManager';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import InsertNewLine from '../newline/InsertNewLine';

const platform = PlatformDetection.detect();
const browser = platform.browser;
const isTouch = platform.deviceType.isTouch();
const isSafari = browser.isSafari();

const endTypingLevel = function (undoManager: UndoManager) {
  if (undoManager.typing) {
    undoManager.typing = false;
    undoManager.add();
  }
};

const handleEnterKeyEvent = function (editor: Editor, event: EditorEvent<KeyboardEvent>) {

  if (event.isDefaultPrevented() || isSafari && isTouch) {
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