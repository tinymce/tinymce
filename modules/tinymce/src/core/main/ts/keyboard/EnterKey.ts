import { Fun, Optional } from '@ephox/katamari';
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

const isCaretAfterHangulCharacter = (rng: Range): boolean => {
  if (!rng.collapsed) {
    return false;
  }
  const startContainer = rng.startContainer;
  if (NodeType.isText(startContainer)) {
    const text = startContainer.data;
    const index = rng.startOffset - 1;
    return index < text.length && text.charCodeAt(index) >= 0xAC00 && text.charCodeAt(index) <= 0xD7A3;
  } else {
    return false;
  }
};

const setup = (editor: Editor): void => {
  let iOSSafariKeydownBookmark: Optional<Bookmark> = Optional.none();

  const iOSSafariKeydownOverride = (editor: Editor): void => {
    iOSSafariKeydownBookmark = Optional.some(editor.selection.getBookmark());
    editor.undoManager.add();
  };

  const iOSSafariKeyupOverride = (editor: Editor, event: EditorEvent<KeyboardEvent>): void => {
    editor.undoManager.undo();
    iOSSafariKeydownBookmark.fold(Fun.noop, (b) => editor.selection.moveToBookmark(b));
    handleEnterKeyEvent(editor, event);
    iOSSafariKeydownBookmark = Optional.none();
  };

  editor.on('keydown', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      if (isIOSSafari && isCaretAfterHangulCharacter(editor.selection.getRng())) {
        // TINY-9746: iOS Safari composes Hangul (Korean) characters by deleting the previous partial character and inserting
        // the composed character. If the native Enter keypress event is not fired, iOS Safari will continue to compose across
        // our custom newline by deleting it and inserting the composed character on the previous line, causing a bug. The workaround
        // is to save a bookmark and an undo level on keydown while not preventing default to allow the native Enter keypress.
        // Then on keyup, the effects of the native Enter keypress is undone and our own Enter key handler is called.
        iOSSafariKeydownOverride(editor);
      } else {
        handleEnterKeyEvent(editor, event);
      }
    }
  });

  editor.on('keyup', (event: EditorEvent<KeyboardEvent>) => {
    if (event.keyCode === VK.ENTER) {
      iOSSafariKeydownBookmark.each(() => iOSSafariKeyupOverride(editor, event));
    }
  });
};

export {
  setup,
  isCaretAfterHangulCharacter
};
