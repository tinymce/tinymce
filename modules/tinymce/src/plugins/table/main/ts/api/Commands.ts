import { Fun, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as CellDialog from '../ui/CellDialog';
import * as RowDialog from '../ui/RowDialog';
import * as TableDialog from '../ui/TableDialog';

const registerCommands = (editor: Editor): void => {
  // Register dialog commands
  Obj.each({
    // AP-101 TableDialog.open renders a slightly different dialog if isNew is true
    mceTableProps: Fun.curry(TableDialog.open, editor, false),
    mceTableRowProps: Fun.curry(RowDialog.open, editor),
    mceTableCellProps: Fun.curry(CellDialog.open, editor)
  }, (func, name) => editor.addCommand(name, () => func()));

  editor.addCommand('mceInsertTableDialog', (_ui) => {
    TableDialog.open(editor, true);
  });
};

export { registerCommands };
