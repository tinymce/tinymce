/**
 * TableCellSelection.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import ElementType from '../dom/ElementType';
import MultiRange from './MultiRange';

var getCellsFromRanges = function (ranges) {
  return Arr.filter(MultiRange.getSelectedNodes(ranges), ElementType.isTableCell);
};

var getCellsFromElement = function (elm) {
  var selectedCells = SelectorFilter.descendants(elm, 'td[data-mce-selected],th[data-mce-selected]');
  return selectedCells;
};

var getCellsFromElementOrRanges = function (ranges, element) {
  var selectedCells = getCellsFromElement(element);
  var rangeCells = getCellsFromRanges(ranges);
  return selectedCells.length > 0 ? selectedCells : rangeCells;
};

var getCellsFromEditor = function (editor) {
  return getCellsFromElementOrRanges(MultiRange.getRanges(editor.selection.getSel()), Element.fromDom(editor.getBody()));
};

export default <any> {
  getCellsFromRanges: getCellsFromRanges,
  getCellsFromElement: getCellsFromElement,
  getCellsFromElementOrRanges: getCellsFromElementOrRanges,
  getCellsFromEditor: getCellsFromEditor
};