/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { TableSelection } from '@ephox/darwin';
import { Arr, Fun } from '@ephox/katamari';
import { TableLookup } from '@ephox/snooker';
import { SelectorFind, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import { ephemera } from './Ephemera';

const getSelectionCellFallback = (element: SugarElement<Node>) =>
  TableLookup.table(element).bind((table) =>
    TableSelection.retrieve(table, ephemera.firstSelectedSelector)
  ).fold(Fun.constant(element), (cells) => cells[0]);

const getSelectionFromSelector = <T extends Element>(selector: string) =>
  (initCell: SugarElement<Node>, isRoot?: (el: SugarElement<Node>) => boolean) => {
    const cellName = SugarNode.name(initCell);
    const cell = cellName === 'col' || cellName === 'colgroup' ? getSelectionCellFallback(initCell) : initCell;
    return SelectorFind.closest<T>(cell, selector, isRoot);
  };

const getSelectionCellOrCaption = getSelectionFromSelector<HTMLTableCellElement | HTMLTableCaptionElement>('th,td,caption');

const getSelectionCell = getSelectionFromSelector<HTMLTableCellElement>('th,td');

const getCellsFromSelection = (editor: Editor): SugarElement<HTMLTableCellElement>[] =>
  Arr.map(editor.selection.getSelectedCells(), SugarElement.fromDom);

export {
  getSelectionCell,
  getSelectionCellOrCaption,
  getCellsFromSelection
};
