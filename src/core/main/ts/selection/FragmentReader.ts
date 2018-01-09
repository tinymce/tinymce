/**
 * FragmentReader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Compare } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { Replication } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Fragment } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import ElementType from '../dom/ElementType';
import Parents from '../dom/Parents';
import SelectionUtils from './SelectionUtils';
import SimpleTableModel from './SimpleTableModel';
import TableCellSelection from './TableCellSelection';

var findParentListContainer = function (parents) {
  return Arr.find(parents, function (elm) {
    return Node.name(elm) === 'ul' || Node.name(elm) === 'ol';
  });
};

var getFullySelectedListWrappers = function (parents, rng) {
  return Arr.find(parents, function (elm) {
    return Node.name(elm) === 'li' && SelectionUtils.hasAllContentsSelected(elm, rng);
  }).fold(
    Fun.constant([]),
    function (li) {
      return findParentListContainer(parents).map(function (listCont) {
        return [
          Element.fromTag('li'),
          Element.fromTag(Node.name(listCont))
        ];
      }).getOr([]);
    }
  );
};

var wrap = function (innerElm, elms) {
  var wrapped = Arr.foldl(elms, function (acc, elm) {
    Insert.append(elm, acc);
    return elm;
  }, innerElm);
  return elms.length > 0 ? Fragment.fromElements([wrapped]) : wrapped;
};

var directListWrappers = function (commonAnchorContainer) {
  if (ElementType.isListItem(commonAnchorContainer)) {
    return Traverse.parent(commonAnchorContainer).filter(ElementType.isList).fold(
      Fun.constant([]),
      function (listElm) {
        return [ commonAnchorContainer, listElm ];
      }
    );
  } else {
    return ElementType.isList(commonAnchorContainer) ? [ commonAnchorContainer ] : [ ];
  }
};

var getWrapElements = function (rootNode, rng) {
  var commonAnchorContainer = Element.fromDom(rng.commonAncestorContainer);
  var parents = Parents.parentsAndSelf(commonAnchorContainer, rootNode);
  var wrapElements = Arr.filter(parents, function (elm) {
    return ElementType.isInline(elm) || ElementType.isHeading(elm);
  });
  var listWrappers = getFullySelectedListWrappers(parents, rng);
  var allWrappers = wrapElements.concat(listWrappers.length ? listWrappers : directListWrappers(commonAnchorContainer));
  return Arr.map(allWrappers, Replication.shallow);
};

var emptyFragment = function () {
  return Fragment.fromElements([]);
};

var getFragmentFromRange = function (rootNode, rng) {
  return wrap(Element.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng));
};

var getParentTable = function (rootElm, cell) {
  return SelectorFind.ancestor(cell, 'table', Fun.curry(Compare.eq, rootElm));
};

var getTableFragment = function (rootNode, selectedTableCells) {
  return getParentTable(rootNode, selectedTableCells[0]).bind(function (tableElm) {
    var firstCell = selectedTableCells[0];
    var lastCell = selectedTableCells[selectedTableCells.length - 1];
    var fullTableModel = SimpleTableModel.fromDom(tableElm);

    return SimpleTableModel.subsection(fullTableModel, firstCell, lastCell).map(function (sectionedTableModel) {
      return Fragment.fromElements([SimpleTableModel.toDom(sectionedTableModel)]);
    });
  }).getOrThunk(emptyFragment);
};

var getSelectionFragment = function (rootNode, ranges) {
  return ranges.length > 0 && ranges[0].collapsed ? emptyFragment() : getFragmentFromRange(rootNode, ranges[0]);
};

var read = function (rootNode, ranges) {
  var selectedCells = TableCellSelection.getCellsFromElementOrRanges(ranges, rootNode);
  return selectedCells.length > 0 ? getTableFragment(rootNode, selectedCells) : getSelectionFragment(rootNode, ranges);
};

export default {
  read: read
};