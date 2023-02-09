import { Fun, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Utils from '../core/Utils';
import * as CellDialog from '../ui/CellDialog';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

const registerCommands = (editor: Editor): void => {
  const runAction = (f: () => void) => {
    if (Utils.isInEditableContext(Utils.getSelectionStart(editor))) {
      f();
    }
  };

  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor),
    mceInsertTableDialog: Fun.curry(TableDialog.open, editor, true),
  }, (func, name) => editor.addCommand(name, () => runAction(func)));
};

export { registerCommands };
