import { Fun, Optional, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import { Bookmark } from '../bookmark/BookmarkTypes';
import * as NodeType from '../dom/NodeType';
import * as InsertNewLine from '../newline/InsertNewLine';
import { endTypingLevelIgnoreLocks } from '../undo/TypingState';

const platform = PlatformDetection.detect();
const isIOSSafari = platform.os.isiOS() && platform.browser.isSafari();

const handleEnterKeyEvent = (editor: Editor, event: EditorEvent<KeyboardEvent>) => {
  if (event.isDefaultPrevented()) {
    return;
  }

  event.preventDefault();

  endTypingLevelIgnoreLocks(editor.undoManager);
  editor.undoManager.transact(() => {
    InsertNewLine.insert(editor, event);
  });
};

const isCursorAfterHangulCharacter = (rng: Range): boolean => {
  if (!rng.collapsed) {
    return false;
  }

  const startContainer = rng.startContainer;
  if (!NodeType.isText(startContainer)) {
    return false;
  } else {
    const text = startContainer.textContent;
    const index = rng.startOffset - 1;
    return Type.isNonNullable(text) && index < text.length && text.charCodeAt(index) >= 0xAC00 && text.charCodeAt(index) <= 0xD7A3;
  }
};

const setup = (editor: Editor): void => {
  let bookmark: Optional<Bookmark> = Optional.none();
  let shouldOverrideKeyup = false;

  const iOSSafariKeydownOverride = (editor: Editor): void => {
    bookmark = Optional.some(editor.selection.getBookmark());
    editor.undoManager.add();
    shouldOverrideKeyup = true;
  };

  const iOSSafariKeyupOverride = (editor: Editor, event: EditorEvent<KeyboardEvent>): void => {
    editor.undoManager.undo();
    bookmark.fold(Fun.noop, (b) => editor.selection.moveToBookmark(b));
    handleEnterKeyEvent(editor, event);
    shouldOverrideKeyup = false;
    bookmark = Optional.none();
  };

  editor.on('keydown', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      if (isIOSSafari && isCursorAfterHangulCharacter(editor.selection.getRng())) {
        iOSSafariKeydownOverride(editor);
      } else {
        handleEnterKeyEvent(editor, event);
      }
    }
  });

  editor.on('keyup', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER && shouldOverrideKeyup) {
      iOSSafariKeyupOverride(editor, event);
    }
  });
};

export {
  setup
};
