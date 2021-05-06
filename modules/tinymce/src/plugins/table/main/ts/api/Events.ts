/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

export interface TableEventData {
  readonly structure: boolean;
  readonly style: boolean;
}

export interface TableModifiedEvent extends TableEventData {
  readonly table: HTMLTableElement;
}

const fireNewRow = (editor: Editor, row: HTMLElement) => editor.fire('newrow', { node: row });
const fireNewCell = (editor: Editor, cell: HTMLElement) => editor.fire('newcell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string) => {
  editor.fire('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string) => {
  editor.fire('ObjectResized', { target, width, height, origin });
};

const fireTableSelectionChange = (editor: Editor, cells: SugarElement[], start: SugarElement, finish: SugarElement, otherCells) => {
  editor.fire('TableSelectionChange', {
    cells,
    start,
    finish,
    otherCells
  });
};

const fireTableSelectionClear = (editor: Editor) => {
  editor.fire('TableSelectionClear');
};

const fireTableModified = (editor: Editor, table: HTMLTableElement, data: TableEventData) => {
  editor.fire('TableModified', { ...data, table });
};

const styleModified: TableEventData = { structure: false, style: true };
const structureModified: TableEventData = { structure: true, style: false };

export {
  fireNewRow,
  fireNewCell,
  fireObjectResizeStart,
  fireObjectResized,
  fireTableSelectionChange,
  fireTableSelectionClear,
  fireTableModified,
  styleModified,
  structureModified
};
