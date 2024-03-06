/*
 NOTE: This file is duplicated in the following locations:
  - core/api/TableEvents.ts
  - plugins/table/api/Events.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import Editor from 'tinymce/core/api/Editor';
import { NewTableCellEvent, NewTableRowEvent, TableEventData } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

// Duplicated in modules/tinymce/src/themes/silver/main/ts/ui/selector/TableSelectorHandles.ts
// NOTE: This is an internal only event so not publicly exposing the interface in EventTypes.ts
export interface TableSelectionChangeEvent {
  readonly cells: HTMLTableCellElement[];
  readonly start: HTMLTableCellElement;
  readonly finish: HTMLTableCellElement;
  readonly otherCells?: {
    readonly upOrLeftCells: HTMLTableCellElement[];
    readonly downOrRightCells: HTMLTableCellElement[];
  };
}

const fireNewRow = (editor: Editor, row: HTMLTableRowElement): EditorEvent<NewTableRowEvent> =>
  editor.dispatch('NewRow', { node: row });

const fireNewCell = (editor: Editor, cell: HTMLTableCellElement): EditorEvent<NewTableCellEvent> =>
  editor.dispatch('NewCell', { node: cell });

const fireTableModified = (editor: Editor, table: HTMLTableElement, data: TableEventData): void => {
  editor.dispatch('TableModified', { ...data, table });
};

const fireTableSelectionChange = (
  editor: Editor,
  cells: HTMLTableCellElement[],
  start: HTMLTableCellElement,
  finish: HTMLTableCellElement,
  otherCells?: TableSelectionChangeEvent['otherCells']
): void => {
  editor.dispatch<'TableSelectionChange', TableSelectionChangeEvent>('TableSelectionChange', {
    cells,
    start,
    finish,
    otherCells
  });
};

const fireTableSelectionClear = (editor: Editor): void => {
  editor.dispatch('TableSelectionClear');
};

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResized', { target, width, height, origin });
};

const styleModified: TableEventData = { structure: false, style: true };
const structureModified: TableEventData = { structure: true, style: false };
const styleAndStructureModified: TableEventData = { structure: true, style: true };

export {
  fireObjectResizeStart,
  fireObjectResized,
  fireTableSelectionChange,
  fireTableSelectionClear,
  fireNewRow,
  fireNewCell,
  fireTableModified,
  styleModified,
  structureModified,
  styleAndStructureModified
};
