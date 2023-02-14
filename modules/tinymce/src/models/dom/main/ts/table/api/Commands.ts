import { Arr, Fun, Obj, Optional, Type } from '@ephox/katamari';
import { CopyCols, CopyRows, Sizes, TableFill, TableLookup, TableConversions } from '@ephox/snooker';
import { Insert, Remove, Replication, SelectorFind, Selectors, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as InsertTable from '../actions/InsertTable';
import { AdvancedPasteTableAction, CombinedTargetsTableAction, TableActionResult, TableActions } from '../actions/TableActions';
import * as Events from '../api/Events';
import * as Utils from '../core/TableUtils';
import * as TableTargets from '../queries/TableTargets';
import * as TableSelection from '../selection/TableSelection';
import * as FakeClipboard from './Clipboard';
import * as Options from './Options';

type ExecuteAction<T> = (table: SugarElement<HTMLTableElement>, startCell: SugarElement<HTMLTableCellElement>) => T;

interface InsertTableArgs {
  readonly rows: number;
  readonly columns: number;
  readonly options?: Record<string, number>;
}

const getSelectionStartCellOrCaption = (editor: Editor): Optional<SugarElement<HTMLTableCellElement | HTMLTableCaptionElement>> =>
  TableSelection.getSelectionCellOrCaption(Utils.getSelectionStart(editor), Utils.getIsRoot(editor)).filter(Utils.isInEditableContext);

const getSelectionStartCell = (editor: Editor): Optional<SugarElement<HTMLTableCellElement>> =>
  TableSelection.getSelectionCell(Utils.getSelectionStart(editor), Utils.getIsRoot(editor)).filter(Utils.isInEditableContext);

const registerCommands = (editor: Editor, actions: TableActions): void => {
  const isRoot = Utils.getIsRoot(editor);
  const eraseTable = () => getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
    TableLookup.table(cellOrCaption, isRoot).filter(Fun.not(isRoot)).each((table) => {
      const cursor = SugarElement.fromText('');
      Insert.after(table, cursor);
      Remove.remove(table);

      if (editor.dom.isEmpty(editor.getBody())) {
        editor.setContent('');
        editor.selection.setCursorLocation();
      } else {
        const rng = editor.dom.createRng();
        rng.setStart(cursor.dom, 0);
        rng.setEnd(cursor.dom, 0);
        editor.selection.setRng(rng);
        editor.nodeChanged();
      }
    });
  });

  const setSizingMode = (sizing: string) => getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
    // Do nothing if tables are forced to use a specific sizing mode
    const isForcedSizing = Options.isTableResponsiveForced(editor) || Options.isTablePixelsForced(editor) || Options.isTablePercentagesForced(editor);
    if (!isForcedSizing) {
      TableLookup.table(cellOrCaption, isRoot).each((table) => {
        if (sizing === 'relative' && !Sizes.isPercentSizing(table)) {
          TableConversions.convertToPercentSize(table);
        } else if (sizing === 'fixed' && !Sizes.isPixelSizing(table)) {
          TableConversions.convertToPixelSize(table);
        } else if (sizing === 'responsive' && !Sizes.isNoneSizing(table)) {
          TableConversions.convertToNoneSize(table);
        }
        Utils.removeDataStyle(table);
        Events.fireTableModified(editor, table.dom, Events.structureModified);
      });
    }
  });

  const getTableFromCell = (cell: SugarElement<HTMLTableCellElement>) => TableLookup.table(cell, isRoot);

  const performActionOnSelection = <T>(action: ExecuteAction<T>): Optional<T> =>
    getSelectionStartCell(editor).bind((cell) =>
      getTableFromCell(cell).map((table) => action(table, cell))
    );

  const toggleTableClass = (_ui: boolean, clazz: string) => {
    performActionOnSelection((table) => {
      editor.formatter.toggle('tableclass', { value: clazz }, table.dom);
      Events.fireTableModified(editor, table.dom, Events.styleModified);
    });
  };

  const toggleTableCellClass = (_ui: boolean, clazz: string) => {
    performActionOnSelection((table) => {
      const selectedCells = TableSelection.getCellsFromSelection(editor);
      const allHaveClass = Arr.forall(selectedCells, (cell) => editor.formatter.match('tablecellclass', { value: clazz }, cell.dom));
      const formatterAction = allHaveClass ? editor.formatter.remove : editor.formatter.apply;

      Arr.each(selectedCells, (cell) =>
        formatterAction('tablecellclass', { value: clazz }, cell.dom)
      );
      Events.fireTableModified(editor, table.dom, Events.styleModified);
    });
  };

  const toggleCaption = () => {
    getSelectionStartCellOrCaption(editor).each((cellOrCaption) => {
      TableLookup.table(cellOrCaption, isRoot).each((table) => {
        SelectorFind.child(table, 'caption').fold(
          () => {
            const caption = SugarElement.fromTag('caption');
            Insert.append(caption, SugarElement.fromText('Caption'));
            Insert.appendAt(table, caption, 0);
            editor.selection.setCursorLocation(caption.dom, 0);
          },
          (caption) => {
            if (SugarNode.isTag('caption')(cellOrCaption)) {
              Selectors.one('td', table).each((td) =>
                editor.selection.setCursorLocation(td.dom, 0)
              );
            }
            Remove.remove(caption);
          }
        );

        Events.fireTableModified(editor, table.dom, Events.structureModified);
      });
    });
  };

  const postExecute = (_data: TableActionResult): void => {
    editor.focus();
  };

  const actOnSelection = (execute: CombinedTargetsTableAction, noEvents: boolean = false) =>
    performActionOnSelection((table, startCell) => {
      const targets = TableTargets.forMenu(TableSelection.getCellsFromSelection(editor), table, startCell);
      execute(table, targets, noEvents).each(postExecute);
    });

  const copyRowSelection = () =>
    performActionOnSelection((table, startCell) => {
      const targets = TableTargets.forMenu(TableSelection.getCellsFromSelection(editor), table, startCell);
      const generators = TableFill.cellOperations(Fun.noop, SugarElement.fromDom(editor.getDoc()), Optional.none());
      return CopyRows.copyRows(table, targets, generators);
    });

  const copyColSelection = () =>
    performActionOnSelection((table, startCell) => {
      const targets = TableTargets.forMenu(TableSelection.getCellsFromSelection(editor), table, startCell);
      return CopyCols.copyCols(table, targets);
    });

  const pasteOnSelection = (execute: AdvancedPasteTableAction, getRows: () => Optional<SugarElement<HTMLTableRowElement | HTMLTableColElement>[]>) =>
    // If we have FakeClipboard rows to paste
    getRows().each((rows) => {
      const clonedRows = Arr.map(rows, (row) => Replication.deep<HTMLTableColElement | HTMLTableRowElement>(row));
      performActionOnSelection((table, startCell) => {
        const generators = TableFill.paste(SugarElement.fromDom(editor.getDoc()));
        const targets = TableTargets.pasteRows(TableSelection.getCellsFromSelection(editor), startCell, clonedRows, generators);
        execute(table, targets).each(postExecute);
      });
    });

  const actOnType = (getAction: (type: string) => CombinedTargetsTableAction) => (_ui: boolean, args: Record<string, any>) =>
    Obj.get(args, 'type').each((type) => {
      actOnSelection(getAction(type), args.no_events);
    });

  // Register action commands
  Obj.each({
    mceTableSplitCells: () => actOnSelection(actions.unmergeCells),
    mceTableMergeCells: () => actOnSelection(actions.mergeCells),
    mceTableInsertRowBefore: () => actOnSelection(actions.insertRowsBefore),
    mceTableInsertRowAfter: () => actOnSelection(actions.insertRowsAfter),
    mceTableInsertColBefore: () => actOnSelection(actions.insertColumnsBefore),
    mceTableInsertColAfter: () => actOnSelection(actions.insertColumnsAfter),
    mceTableDeleteCol: () => actOnSelection(actions.deleteColumn),
    mceTableDeleteRow: () => actOnSelection(actions.deleteRow),
    mceTableCutCol: () => copyColSelection().each((selection) => {
      FakeClipboard.setColumns(selection);
      actOnSelection(actions.deleteColumn);
    }),
    mceTableCutRow: () => copyRowSelection().each((selection) => {
      FakeClipboard.setRows(selection);
      actOnSelection(actions.deleteRow);
    }),
    mceTableCopyCol: () => copyColSelection().each((selection) => FakeClipboard.setColumns(selection)),
    mceTableCopyRow: () => copyRowSelection().each((selection) => FakeClipboard.setRows(selection)),
    mceTablePasteColBefore: () => pasteOnSelection(actions.pasteColsBefore, FakeClipboard.getColumns),
    mceTablePasteColAfter: () => pasteOnSelection(actions.pasteColsAfter, FakeClipboard.getColumns),
    mceTablePasteRowBefore: () => pasteOnSelection(actions.pasteRowsBefore, FakeClipboard.getRows),
    mceTablePasteRowAfter: () => pasteOnSelection(actions.pasteRowsAfter, FakeClipboard.getRows),
    mceTableDelete: eraseTable,
    mceTableCellToggleClass: toggleTableCellClass,
    mceTableToggleClass: toggleTableClass,
    mceTableToggleCaption: toggleCaption,
    mceTableSizingMode: (_ui: boolean, sizing: string) => setSizingMode(sizing),
    mceTableCellType: actOnType((type) => type === 'th' ? actions.makeCellsHeader : actions.unmakeCellsHeader),
    mceTableColType: actOnType((type) => type === 'th' ? actions.makeColumnsHeader : actions.unmakeColumnsHeader),
    mceTableRowType: actOnType((type) => {
      switch (type) {
        case 'header':
          return actions.makeRowsHeader;
        case 'footer':
          return actions.makeRowsFooter;
        default:
          return actions.makeRowsBody;
      }
    })
  }, (func, name) => editor.addCommand(name, func));

  editor.addCommand('mceInsertTable', (_ui: boolean, args: InsertTableArgs) => {
    InsertTable.insertTable(editor, args.rows, args.columns, args.options);
  });

  // Apply cell style using command (background color, border color, border style and border width)
  // tinyMCE.activeEditor.execCommand('mceTableApplyCellStyle', false, { backgroundColor: 'red', borderColor: 'blue' })
  // Remove cell style using command (an empty string indicates to remove the style)
  // tinyMCE.activeEditor.execCommand('mceTableApplyCellStyle', false, { backgroundColor: '' })
  editor.addCommand('mceTableApplyCellStyle', (_ui: boolean, args: Record<string, string>) => {
    const getFormatName = (style: string) => 'tablecell' + style.toLowerCase().replace('-', '');

    if (!Type.isObject(args)) {
      return;
    }
    const cells = Arr.filter(TableSelection.getCellsFromSelection(editor), Utils.isInEditableContext);
    if (cells.length === 0) {
      return;
    }

    const validArgs = Obj.filter(args, (value, style) =>
      editor.formatter.has(getFormatName(style)) && Type.isString(value)
    );
    if (Obj.isEmpty(validArgs)) {
      return;
    }

    Obj.each(validArgs, (value, style) => {
      const formatName = getFormatName(style);

      Arr.each(cells, (cell) => {
        if (value === '') {
          editor.formatter.remove(formatName, { value: null }, cell.dom, true);
        } else {
          editor.formatter.apply(formatName, { value }, cell.dom);
        }
      });
    });

    /*
      Use the first cell in the selection to get the table and fire the TableModified event.
      If this command is applied over multiple tables, only the first table selected
      will have a TableModified event thrown.
    */
    getTableFromCell(cells[0]).each(
      (table) => Events.fireTableModified(editor, table.dom, Events.styleModified)
    );
  });

};

export { registerCommands };
