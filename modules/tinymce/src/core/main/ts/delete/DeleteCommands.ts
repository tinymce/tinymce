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

const findAction = (editor: Editor, caret: Cell<Text | null>, forward: boolean) =>
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
  ], (item) => item(editor, forward))
    .filter((_) => editor.selection.isEditable());

const deleteCommand = (editor: Editor, caret: Cell<Text | null>): void => {
  const result = findAction(editor, caret, false);

  result.fold(
    () => {
      // We can't use an `execEditorDeleteCommand` here, otherwise we'd get
      // possible infinite recursion (as it would trigger `deleteCommand` again)
      if (editor.selection.isEditable()) {
        DeleteUtils.execNativeDeleteCommand(editor);
        DeleteUtils.paddEmptyBody(editor);
      }
    },
    Fun.call
  );
};

const forwardDeleteCommand = (editor: Editor, caret: Cell<Text | null>): void => {
  const result = findAction(editor, caret, true);

  result.fold(
    () => {
      if (editor.selection.isEditable()) {
        DeleteUtils.execNativeForwardDeleteCommand(editor);
      }
    },
    Fun.call
  );
};

const setup = (editor: Editor, caret: Cell<Text | null>): void => {
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
