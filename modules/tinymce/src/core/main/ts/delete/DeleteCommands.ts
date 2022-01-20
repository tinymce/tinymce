/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell, Fun } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as BlockBoundaryDelete from './BlockBoundaryDelete';
import * as BlockRangeDelete from './BlockRangeDelete';
import * as CaretBoundaryDelete from './CaretBoundaryDelete';
import * as CefDelete from './CefDelete';
import * as DeleteUtils from './DeleteUtils';
import * as ImageBlockDelete from './ImageBlockDelete';
import * as InlineBoundaryDelete from './InlineBoundaryDelete';
import * as InlineFormatDelete from './InlineFormatDelete';
import * as MediaDelete from './MediaDelete';
import * as Outdent from './Outdent';
import * as TableDelete from './TableDelete';

const nativeCommand = (editor: Editor, command: string): void => {
  editor.getDoc().execCommand(command, false, null);
};

const findAction = (editor: Editor, caret: Cell<Text>, forward: boolean) =>
  Arr.findMap([
    Outdent.backspaceDelete,
    CefDelete.backspaceDelete,
    CaretBoundaryDelete.backspaceDelete,
    (editor: Editor, forward: boolean) => InlineBoundaryDelete.backspaceDelete(editor, caret, forward),
    BlockBoundaryDelete.backspaceDelete,
    TableDelete.backspaceDelete,
    ImageBlockDelete.backspaceDelete,
    MediaDelete.backspaceDelete,
    BlockRangeDelete.backspaceDelete,
    InlineFormatDelete.backspaceDelete,
  ], (item) => item(editor, forward));

const deleteCommand = (editor: Editor, caret: Cell<Text>): void => {
  const result = findAction(editor, caret, false);

  result.fold(
    () => {
      nativeCommand(editor, 'Delete');
      DeleteUtils.paddEmptyBody(editor);
    },
    Fun.call
  );
};

const forwardDeleteCommand = (editor: Editor, caret: Cell<Text>): void => {
  const result = findAction(editor, caret, true);

  result.fold(
    () => nativeCommand(editor, 'ForwardDelete'),
    Fun.call
  );
};

const setup = (editor: Editor, caret: Cell<Text>): void => {
  editor.addCommand('delete', () => {
    deleteCommand(editor, caret);
  });

  editor.addCommand('forwardDelete', () => {
    forwardDeleteCommand(editor, caret);
  });
};

export {
  deleteCommand,
  forwardDeleteCommand,
  setup
};
