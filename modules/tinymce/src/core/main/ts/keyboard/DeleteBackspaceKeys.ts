/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Text, KeyboardEvent } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import BlockBoundaryDelete from '../delete/BlockBoundaryDelete';
import BlockRangeDelete from '../delete/BlockRangeDelete';
import CefDelete from '../delete/CefDelete';
import CefBoundaryDelete from '../delete/CefBoundaryDelete';
import InlineBoundaryDelete from '../delete/InlineBoundaryDelete';
import InlineFormatDelete from '../delete/InlineFormatDelete';
import TableDelete from '../delete/TableDelete';
import MatchKeys from './MatchKeys';
import VK from '../api/util/VK';
import Editor from '../api/Editor';
import PageBreakDelete from '../delete/ImageBlockDelete';
import { EditorEvent } from '../api/util/EventDispatcher';
import Outdent from '../delete/Outdent';

const executeKeydownOverride = function (editor: Editor, caret: Cell<Text>, evt: KeyboardEvent) {
  MatchKeys.execute([
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(Outdent.backspaceDelete, editor, false) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefBoundaryDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CefBoundaryDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(InlineBoundaryDelete.backspaceDelete, editor, caret, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(TableDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(TableDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(PageBreakDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(PageBreakDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(BlockRangeDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(BlockBoundaryDelete.backspaceDelete, editor, true) },
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(InlineFormatDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(InlineFormatDelete.backspaceDelete, editor, true) }
  ], evt).each(function (_) {
    evt.preventDefault();
  });
};

const executeKeyupOverride = function (editor: Editor, evt: KeyboardEvent) {
  MatchKeys.execute([
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) },
    { keyCode: VK.DELETE, action: MatchKeys.action(CefDelete.paddEmptyElement, editor) }
  ], evt);
};

const setup = function (editor: Editor, caret: Cell<Text>) {
  editor.on('keydown', function (evt: EditorEvent<KeyboardEvent>) {
    if (evt.isDefaultPrevented() === false) {
      executeKeydownOverride(editor, caret, evt);
    }
  });

  editor.on('keyup', function (evt: EditorEvent<KeyboardEvent>) {
    if (evt.isDefaultPrevented() === false) {
      executeKeyupOverride(editor, evt);
    }
  });
};

export default {
  setup
};