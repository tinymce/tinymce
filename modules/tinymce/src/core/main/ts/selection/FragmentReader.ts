/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';
import { Compare, Insert, Replication, Element, Fragment, Node, SelectorFind, Traverse } from '@ephox/sugar';
import * as ElementType from '../dom/ElementType';
import Parents from '../dom/Parents';
import * as SelectionUtils from './SelectionUtils';
import SimpleTableModel from './SimpleTableModel';
import TableCellSelection from './TableCellSelection';

const findParentListContainer = function (parents) {
  return Arr.find(parents, function (elm) {
    return Node.name(elm) === 'ul' || Node.name(elm) === 'ol';
  });
};

const getFullySelectedListWrappers = function (parents, rng) {
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

const wrap = function (innerElm, elms) {
  const wrapped = Arr.foldl(elms, function (acc, elm) {
    Insert.append(elm, acc);
    return elm;
  }, innerElm);
  return elms.length > 0 ? Fragment.fromElements([wrapped]) : wrapped;
};

const directListWrappers = function (commonAnchorContainer) {
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

const getWrapElements = function (rootNode, rng) {
  const commonAnchorContainer = Element.fromDom(rng.commonAncestorContainer);
  const parents = Parents.parentsAndSelf(commonAnchorContainer, rootNode);
  const wrapElements = Arr.filter(parents, function (elm) {
    return ElementType.isInline(elm) || ElementType.isHeading(elm);
  });
  const listWrappers = getFullySelectedListWrappers(parents, rng);
  const allWrappers = wrapElements.concat(listWrappers.length ? listWrappers : directListWrappers(commonAnchorContainer));
  return Arr.map(allWrappers, Replication.shallow);
};

const emptyFragment = function () {
  return Fragment.fromElements([]);
};

const getFragmentFromRange = function (rootNode, rng) {
  return wrap(Element.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng));
};

const getParentTable = function (rootElm, cell) {
  return SelectorFind.ancestor(cell, 'table', Fun.curry(Compare.eq, rootElm));
};

const getTableFragment = function (rootNode, selectedTableCells) {
  return getParentTable(rootNode, selectedTableCells[0]).bind(function (tableElm) {
    const firstCell = selectedTableCells[0];
    const lastCell = selectedTableCells[selectedTableCells.length - 1];
    const fullTableModel = SimpleTableModel.fromDom(tableElm);

    return SimpleTableModel.subsection(fullTableModel, firstCell, lastCell).map(function (sectionedTableModel) {
      return Fragment.fromElements([SimpleTableModel.toDom(sectionedTableModel)]);
    });
  }).getOrThunk(emptyFragment);
};

const getSelectionFragment = function (rootNode, ranges) {
  return ranges.length > 0 && ranges[0].collapsed ? emptyFragment() : getFragmentFromRange(rootNode, ranges[0]);
};

const read = function (rootNode, ranges) {
  const selectedCells = TableCellSelection.getCellsFromElementOrRanges(ranges, rootNode);
  return selectedCells.length > 0 ? getTableFragment(rootNode, selectedCells) : getSelectionFragment(rootNode, ranges);
};

export default {
  read
};