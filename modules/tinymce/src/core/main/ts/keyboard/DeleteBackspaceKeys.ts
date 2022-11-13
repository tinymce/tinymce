import { Cell } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as BlockBoundaryDelete from '../delete/BlockBoundaryDelete';
import * as BlockRangeDelete from '../delete/BlockRangeDelete';
import * as CaretBoundaryDelete from '../delete/CaretBoundaryDelete';
import * as CefDelete from '../delete/CefDelete';
import * as ImageBlockDelete from '../delete/ImageBlockDelete';
import * as InlineBoundaryDelete from '../delete/InlineBoundaryDelete';
import * as InlineFormatDelete from '../delete/InlineFormatDelete';
import * as MediaDelete from '../delete/MediaDelete';
import * as Outdent from '../delete/Outdent';
import * as TableDelete from '../delete/TableDelete';
import { fireFakeBeforeInputEvent, fireFakeInputEvent } from './FakeInputEvents';
import * as MatchKeys from './MatchKeys';

// global backspace keydown state for Meta + Backspace emulation on macOS
let isBackspaceKeydown = false;

const executeKeydownOverride = (editor: Editor, caret: Cell<Text | null>, evt: KeyboardEvent) => {
  isBackspaceKeydown = evt.keyCode === VK.BACKSPACE;
  const inputType = isBackspaceKeydown ? 'deleteContentBackward' : 'deleteContentForward';

  MatchKeys.executeWithDelayedAction([
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(Outdent.backspaceDelete, editor) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CaretBoundaryDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CaretBoundaryDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(TableDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(TableDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(ImageBlockDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(ImageBlockDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(MediaDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(MediaDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(InlineFormatDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(InlineFormatDelete.backspaceDelete, editor, true) }
  ], evt).each((applyAction) => {
    evt.preventDefault();
    const beforeInput = fireFakeBeforeInputEvent(editor, inputType);

    if (!beforeInput.isDefaultPrevented()) {
      applyAction();
      fireFakeInputEvent(editor, inputType);
    }
  });
};

const executeKeyupOverride = (editor: Editor, evt: KeyboardEvent) => {
  const os = PlatformDetection.detect().os;
  const multiDeleteKeyPatterns: MatchKeys.KeyPattern[] = os.isMacOS() ? [
    { keyCode: VK.BACKSPACE, altKey: true, action: MatchKeys.action(InlineFormatDelete.refreshCaretFormat, editor) },
    { keyCode: VK.DELETE, altKey: true, action: MatchKeys.action(InlineFormatDelete.refreshCaretFormat, editor) },
  ] : [
    { keyCode: VK.BACKSPACE, ctrlKey: true, action: MatchKeys.action(InlineFormatDelete.refreshCaretFormat, editor) },
    { keyCode: VK.BACKSPACE, ctrlKey: true, action: MatchKeys.action(InlineFormatDelete.refreshCaretFormat, editor) }
  ];

  // macOS surpresses keyup events for most keys including Backspace when Meta key is engaged
  // To emulate Meta + Backspace on macOS, add a pattern for the meta key when backspace was
  // detected on keydown
  if (os.isMacOS() && isBackspaceKeydown) {
    multiDeleteKeyPatterns.push({ keyCode: 91, action: MatchKeys.action(InlineFormatDelete.refreshCaretFormat, editor) });
  }

  MatchKeys.execute([
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) },
    ...multiDeleteKeyPatterns
  ], evt);

  isBackspaceKeydown = false;
};

const setup = (editor: Editor, caret: Cell<Text | null>): void => {
  editor.on('keydown', (evt: EditorEvent<KeyboardEvent>) => {
    if (!evt.isDefaultPrevented()) {
      executeKeydownOverride(editor, caret, evt);
    }
  });

  editor.on('keyup', (evt: EditorEvent<KeyboardEvent>) => {
    if (!evt.isDefaultPrevented()) {
      executeKeyupOverride(editor, evt);
    }
  });
};

export {
  setup
};
