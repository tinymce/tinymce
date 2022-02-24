/*
 NOTE: This file is duplicated in the following locations:
  - core/api/TableEvents.ts
  - models/dom/table/api/Events.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

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

const styleModified: TableEventData = { structure: false, style: true };
const structureModified: TableEventData = { structure: true, style: false };
const styleAndStructureModified: TableEventData = { structure: true, style: true };

export {
  fireNewRow,
  fireNewCell,
  fireTableModified,
  styleModified,
  structureModified,
  styleAndStructureModified
};
