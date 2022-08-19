/*
 NOTE: This file is duplicated in the following locations:
  - core/api/TableEvents.ts
  - plugins/table/api/Events.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Optional } from '@ephox/katamari';
import { OtherCells } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { NewTableCellEvent, NewTableRowEvent, TableEventData } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const fireNewRow = (editor: Editor, row: HTMLTableRowElement): EditorEvent<NewTableRowEvent> =>
  editor.dispatch('NewRow', { node: row });

const fireNewCell = (editor: Editor, cell: HTMLTableCellElement): EditorEvent<NewTableCellEvent> =>
  editor.dispatch('NewCell', { node: cell });

const fireTableModified = (editor: Editor, table: HTMLTableElement, data: TableEventData): void => {
  editor.dispatch('TableModified', { ...data, table });
};

const fireTableSelectionChange = (
  editor: Editor,
  cells: SugarElement<HTMLTableCellElement>[],
  start: SugarElement<HTMLTableCellElement>,
  finish: SugarElement<HTMLTableCellElement>,
  otherCells: Optional<OtherCells.OtherCells>
): void => {
  editor.dispatch('TableSelectionChange', {
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
