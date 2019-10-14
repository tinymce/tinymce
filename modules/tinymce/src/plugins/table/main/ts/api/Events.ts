/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';
import { Element } from '@ephox/sugar';

const fireNewRow = (editor: Editor, row: HTMLElement) => editor.fire('newrow', { node: row });
const fireNewCell = (editor: Editor, cell: HTMLElement) => editor.fire('newcell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResizeStart', { target, width, height });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResized', { target, width, height });
};

const fireTableSelectionChange = (editor: Editor, cells: Element[], start: Element, finish: Element, otherCells) => {
  editor.fire('tableselectionchange', {
    cells,
    start,
    finish,
    otherCells
  });
};

const fireTableSelectionClear = (editor: Editor) => {
  editor.fire('tableselectionclear');
};

export {
  fireNewRow,
  fireNewCell,
  fireObjectResizeStart,
  fireObjectResized,
  fireTableSelectionChange,
  fireTableSelectionClear
};
