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

import Editor from './Editor';
import { NewTableCellEvent, NewTableRowEvent } from './EventTypes';
import { EditorEvent } from './util/EventDispatcher';

const fireNewRow = (editor: Editor, row: HTMLTableRowElement): EditorEvent<NewTableRowEvent> =>
  editor.dispatch('NewRow', { node: row });

const fireNewCell = (editor: Editor, cell: HTMLTableCellElement): EditorEvent<NewTableCellEvent> =>
  editor.dispatch('NewCell', { node: cell });

const fireObjectResizeStart = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResizeStart', { target, width, height, origin });
};

const fireObjectResized = (editor: Editor, target: HTMLElement, width: number, height: number, origin: string): void => {
  editor.dispatch('ObjectResized', { target, width, height, origin });
};

export {
  fireNewRow,
  fireNewCell,
  fireObjectResizeStart,
  fireObjectResized
};
