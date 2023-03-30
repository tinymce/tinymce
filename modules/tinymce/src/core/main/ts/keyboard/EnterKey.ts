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

const setup = (editor: Editor): void => {
  let bookmark: Optional<Bookmark> = Optional.none();
  let shouldOverrideKeyup = false;

  const iOSSafariKeydownOverride = (editor: Editor): void => {
    const rng = editor.selection.getRng();
    if (rng.collapsed && NodeType.isText(rng.commonAncestorContainer)) {
      bookmark = Optional.some(editor.selection.getBookmark());
      editor.undoManager.add();
      shouldOverrideKeyup = true;
    }
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
      if (isIOSSafari) {
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
