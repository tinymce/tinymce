/**
 * Events.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement } from '@ephox/dom-globals';

const fireNewRow = (editor: Editor, row: HTMLElement) => editor.fire('newrow', { node: row });
const fireNewCell = (editor: Editor, cell: HTMLElement) => editor.fire('newcell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResizeStart', { target, width, height });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number) => {
  editor.fire('ObjectResized', { target, width, height });
};

export {
  fireNewRow,
  fireNewCell,
  fireObjectResizeStart,
  fireObjectResized
};
