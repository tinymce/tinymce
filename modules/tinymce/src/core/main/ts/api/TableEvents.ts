/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/*
 NOTE: This file is duplicated in the following locations:
  - models/dom/table/api/Events.ts
  - plugins/table/api/Events.ts
  - advtable
 Make sure that if making changes to this file, the other files are updated as well
 */

import { Optional } from '@ephox/katamari';
import { OtherCells } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from './Editor';
import { NewTableCellEvent, NewTableRowEvent, TableEventData } from './EventTypes';
import { EditorEvent } from './util/EventDispatcher';

const fireNewRow = (editor: Editor, row: HTMLTableRowElement): EditorEvent<NewTableRowEvent> =>
  editor.fire('NewRow', { node: row });

const fireNewCell = (editor: Editor, cell: HTMLTableCellElement): EditorEvent<NewTableCellEvent> =>
  editor.fire('NewCell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.fire('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.fire('ObjectResized', { target, width, height, origin });
};

// TODO: TINY-8368 Unwrap SugarElement references and need for Optional when firing event
const fireTableSelectionChange = (
  editor: Editor,
  cells: SugarElement<HTMLTableCellElement>[],
  start: SugarElement<HTMLTableCellElement>,
  finish: SugarElement<HTMLTableCellElement>,
  otherCells: Optional<OtherCells.OtherCells>
): void => {
  editor.fire('TableSelectionChange', {
    cells,
    start,
    finish,
    otherCells
  });
};

const fireTableSelectionClear = (editor: Editor): void => {
  editor.fire('TableSelectionClear');
};

const fireTableModified = (editor: Editor, table: HTMLTableElement, data: TableEventData): void => {
  editor.fire('TableModified', { ...data, table });
};

const styleModified: TableEventData = { structure: false, style: true };
const structureModified: TableEventData = { structure: true, style: false };
const styleAndStructureModified: TableEventData = { structure: true, style: true };

export {
  fireNewRow,
  fireNewCell,
  fireObjectResizeStart,
  fireObjectResized,
  fireTableSelectionChange,
  fireTableSelectionClear,
  fireTableModified,
  styleModified,
  structureModified,
  styleAndStructureModified
};
