/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLLIElement, HTMLOListElement, HTMLTableCellElement, HTMLTableElement, Node, Range } from '@ephox/dom-globals';
import { Arr, Fun, Obj, Option, Strings } from '@ephox/katamari';
import { Compare, Css, Element, Fragment, Insert, Node as SugarNode, Replication, SelectorFind, Traverse } from '@ephox/sugar';
import * as ElementType from '../dom/ElementType';
import * as Parents from '../dom/Parents';
import * as SelectionUtils from './SelectionUtils';
import * as SimpleTableModel from './SimpleTableModel';
import * as TableCellSelection from './TableCellSelection';

const findParentListContainer = (parents: Element[]): Option<Element<HTMLLIElement | HTMLOListElement>> =>
  Arr.find(parents, (elm) => SugarNode.name(elm) === 'ul' || SugarNode.name(elm) === 'ol');

const getFullySelectedListWrappers = (parents: Element<Node>[], rng: Range) =>
  Arr.find(parents, (elm) => SugarNode.name(elm) === 'li' && SelectionUtils.hasAllContentsSelected(elm, rng)).fold(
    Fun.constant([]),
    (_li) =>
      findParentListContainer(parents).map((listCont) => {
        const listElm = Element.fromTag(SugarNode.name(listCont));
        // Retain any list-style* styles when generating the new fragment
        const listStyles = Obj.filter(Css.getAllRaw(listCont), (_style, name) => Strings.startsWith(name, 'list-style'));
        Css.setAll(listElm, listStyles);
        return [
          Element.fromTag('li'),
          listElm
        ];
      }).getOr([])
  );

const wrap = (innerElm: Element<Node>, elms: Element<Node>[]) => {
  const wrapped = Arr.foldl(elms, (acc, elm) => {
    Insert.append(elm, acc);
    return elm;
  }, innerElm);
  return elms.length > 0 ? Fragment.fromElements([ wrapped ]) : wrapped;
};

const directListWrappers = (commonAnchorContainer: Element<Node>) => {
  if (ElementType.isListItem(commonAnchorContainer)) {
    return Traverse.parent(commonAnchorContainer).filter(ElementType.isList).fold(
      Fun.constant([]),
      (listElm) => [ commonAnchorContainer, listElm ]
    );
  } else {
    return ElementType.isList(commonAnchorContainer) ? [ commonAnchorContainer ] : [ ];
  }
};

const getWrapElements = (rootNode: Element<Node>, rng: Range) => {
  const commonAnchorContainer = Element.fromDom(rng.commonAncestorContainer);
  const parents = Parents.parentsAndSelf(commonAnchorContainer, rootNode);
  const wrapElements = Arr.filter(parents, (elm) => ElementType.isInline(elm) || ElementType.isHeading(elm));
  const listWrappers = getFullySelectedListWrappers(parents, rng);
  const allWrappers = wrapElements.concat(listWrappers.length ? listWrappers : directListWrappers(commonAnchorContainer));
  return Arr.map(allWrappers, Replication.shallow);
};

const emptyFragment = () => Fragment.fromElements([]);

const getFragmentFromRange = (rootNode: Element<Node>, rng: Range) =>
  wrap(Element.fromDom(rng.cloneContents()), getWrapElements(rootNode, rng));

const getParentTable = (rootElm: Element<Node>, cell: Element<HTMLTableCellElement>): Option<Element<HTMLTableElement>> =>
  SelectorFind.ancestor(cell, 'table', Fun.curry(Compare.eq, rootElm));

const getTableFragment = (rootNode: Element<Node>, selectedTableCells: Element<HTMLTableCellElement>[]) =>
  getParentTable(rootNode, selectedTableCells[0]).bind((tableElm) => {
    const firstCell = selectedTableCells[0];
    const lastCell = selectedTableCells[selectedTableCells.length - 1];
    const fullTableModel = SimpleTableModel.fromDom(tableElm);

    return SimpleTableModel.subsection(fullTableModel, firstCell, lastCell).map((sectionedTableModel) =>
      Fragment.fromElements([ SimpleTableModel.toDom(sectionedTableModel) ])
    );
  }).getOrThunk(emptyFragment);

const getSelectionFragment = (rootNode: Element<Node>, ranges: Range[]) =>
  ranges.length > 0 && ranges[0].collapsed ? emptyFragment() : getFragmentFromRange(rootNode, ranges[0]);

const read = (rootNode: Element<Node>, ranges: Range[]) => {
  const selectedCells = TableCellSelection.getCellsFromElementOrRanges(ranges, rootNode);
  return selectedCells.length > 0 ? getTableFragment(rootNode, selectedCells) : getSelectionFragment(rootNode, ranges);
};

export {
  read
};
