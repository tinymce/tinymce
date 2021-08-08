/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { OtherCells } from '@ephox/snooker';
import { SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

export interface TableEventData {
  readonly structure: boolean;
  readonly style: boolean;
}

export interface TableModifiedEvent extends TableEventData {
  readonly table: HTMLTableElement;
}

const fireNewRow = (editor: Editor, row: HTMLTableRowElement): EditorEvent<{ node: HTMLTableRowElement }> =>
  editor.fire('newrow', { node: row });

const fireNewCell = (editor: Editor, cell: HTMLTableCellElement): EditorEvent<{ node: HTMLTableCellElement }> =>
  editor.fire('newcell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.fire('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.fire('ObjectResized', { target, width, height, origin });
};

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
