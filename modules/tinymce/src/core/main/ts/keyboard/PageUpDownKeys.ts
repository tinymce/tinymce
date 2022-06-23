import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { NodeChangeEvent } from '../api/EventTypes';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as BoundarySelection from './BoundarySelection';
import * as MatchKeys from './MatchKeys';

const platform = PlatformDetection.detect();

const executeKeyupAction = (editor: Editor, caret: Cell<Text | null>, evt: KeyboardEvent) => {
  MatchKeys.execute([
    { keyCode: VK.PAGE_UP, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, false, caret) },
    { keyCode: VK.PAGE_DOWN, action: MatchKeys.action(BoundarySelection.moveToLineEndPoint, editor, true, caret) }
  ], evt);
};

const stopImmediatePropagation = (e: EditorEvent<NodeChangeEvent>) => e.stopImmediatePropagation();

const isPageUpDown = (evt: EditorEvent<KeyboardEvent>) =>
  evt.keyCode === VK.PAGE_UP || evt.keyCode === VK.PAGE_DOWN;

const setNodeChangeBlocker = (blocked: Cell<boolean>, editor: Editor, block: boolean) => {
  // Node change event is only blocked while the user is holding down the page up/down key it would have limited effects on other things
  // Prevents a flickering UI while caret move in and out of the inline boundary element
  if (block && !blocked.get()) {
    editor.on('NodeChange', stopImmediatePropagation, true);
  } else if (!block && blocked.get()) {
    editor.off('NodeChange', stopImmediatePropagation);
  }

  blocked.set(block);
};

// Determining the correct placement on key up/down is very complicated and would require handling many edge cases,
// which we don't have the resources to handle currently. As such, we allow the browser to change the selection and then make adjustments later.
const setup = (editor: Editor, caret: Cell<Text | null>): void => {

  // Mac OS doesn't move the selection when pressing page up/down and as such TinyMCE shouldn't be moving it either
  if (platform.os.isMacOS()) {
    return;
  }

  const blocked = Cell(false);

  editor.on('keydown', (evt) => {
    if (isPageUpDown(evt)) {
      setNodeChangeBlocker(blocked, editor, true);
    }
  });

  editor.on('keyup', (evt) => {
    if (!evt.isDefaultPrevented()) {
      executeKeyupAction(editor, caret, evt);
    }

    if (isPageUpDown(evt) && blocked.get()) {
      setNodeChangeBlocker(blocked, editor, false);
      editor.nodeChanged();
    }
  });
};

export {
  setup
};
