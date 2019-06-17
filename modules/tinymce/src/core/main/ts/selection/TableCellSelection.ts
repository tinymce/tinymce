/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { Element, SelectorFilter } from '@ephox/sugar';
import * as ElementType from '../dom/ElementType';
import MultiRange from './MultiRange';
import Editor from '../api/Editor';

const getCellsFromRanges = function (ranges) {
  return Arr.filter(MultiRange.getSelectedNodes(ranges), ElementType.isTableCell);
};

const getCellsFromElement = function (elm) {
  return SelectorFilter.descendants(elm, 'td[data-mce-selected],th[data-mce-selected]');
};

const getCellsFromElementOrRanges = function (ranges, element) {
  const selectedCells = getCellsFromElement(element);
  const rangeCells = getCellsFromRanges(ranges);
  return selectedCells.length > 0 ? selectedCells : rangeCells;
};

const getCellsFromEditor = function (editor: Editor) {
  return getCellsFromElementOrRanges(MultiRange.getRanges(editor.selection.getSel()), Element.fromDom(editor.getBody()));
};

export default {
  getCellsFromRanges,
  getCellsFromElement,
  getCellsFromElementOrRanges,
  getCellsFromEditor
};