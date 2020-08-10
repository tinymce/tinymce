/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLTableCellElement, Range } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Element, SelectorFilter } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as ElementType from '../dom/ElementType';
import * as MultiRange from './MultiRange';

const getCellsFromRanges = (ranges: Range[]): Element<HTMLTableCellElement>[] =>
  Arr.filter(MultiRange.getSelectedNodes(ranges), ElementType.isTableCell);

const getCellsFromElement = (elm: Element): Element<HTMLTableCellElement>[] =>
  SelectorFilter.descendants(elm, 'td[data-mce-selected],th[data-mce-selected]');

const getCellsFromElementOrRanges = (ranges: Range[], element: Element): Element<HTMLTableCellElement>[] => {
  const selectedCells = getCellsFromElement(element);
  return selectedCells.length > 0 ? selectedCells : getCellsFromRanges(ranges);
};

const getCellsFromEditor = (editor: Editor) =>
  getCellsFromElementOrRanges(MultiRange.getRanges(editor.selection.getSel()), Element.fromDom(editor.getBody()));

export {
  getCellsFromRanges,
  getCellsFromElement,
  getCellsFromElementOrRanges,
  getCellsFromEditor
};
