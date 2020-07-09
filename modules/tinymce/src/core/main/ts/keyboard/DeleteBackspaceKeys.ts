/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { KeyboardEvent, Text } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import VK from '../api/util/VK';
import * as BlockBoundaryDelete from '../delete/BlockBoundaryDelete';
import * as BlockRangeDelete from '../delete/BlockRangeDelete';
import * as CefBoundaryDelete from '../delete/CefBoundaryDelete';
import * as CefDelete from '../delete/CefDelete';
import * as ImageBlockDelete from '../delete/ImageBlockDelete';
import * as InlineBoundaryDelete from '../delete/InlineBoundaryDelete';
import * as InlineFormatDelete from '../delete/InlineFormatDelete';
import * as Outdent from '../delete/Outdent';
import * as TableDelete from '../delete/TableDelete';
import * as MatchKeys from './MatchKeys';

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
    { keyCode: VK.BACKSPACE, action: MatchKeys.action(ImageBlockDelete.backspaceDelete, editor, false) },
    { keyCode: VK.DELETE, action: MatchKeys.action(ImageBlockDelete.backspaceDelete, editor, true) },
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

export {
  setup
};
