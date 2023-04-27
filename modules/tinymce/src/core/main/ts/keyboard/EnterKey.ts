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

const isCaretAfterKoreanCharacter = (rng: Range): boolean => {
  if (!rng.collapsed) {
    return false;
  }
  const startContainer = rng.startContainer;
  if (NodeType.isText(startContainer)) {
    // Hangul: \uAC00-\uD7AF
    // Hangul Jamo: \u1100-\u11FF
    // Hangul Compatibility Jamo: \u3130-\u318F
    // Hangul Jamo Extended-A: \uA960-\uA97F
    // Hangul Jamo Extended-B: \uD7B0-\uD7FF
    const koreanCharRegex = /^[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\uA960-\uA97F\uD7B0-\uD7FF]$/;
    const char = startContainer.data.charAt(rng.startOffset - 1);
    return koreanCharRegex.test(char);
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
      if (isIOSSafari && isCaretAfterKoreanCharacter(editor.selection.getRng())) {
        // TINY-9746: iOS Safari composes Korean characters by deleting the previous partial character and inserting
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
  isCaretAfterKoreanCharacter
};
