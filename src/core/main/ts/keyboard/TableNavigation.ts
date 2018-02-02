/**
 * TableNavigation.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CefUtils from '../keyboard/CefUtils';
import { Traverse, Element, Compare, PredicateFilter } from '@ephox/sugar';
import { Arr, Fun, Option } from '@ephox/katamari';
import NodeType from '../dom/NodeType';
import { PlatformDetection } from '@ephox/sand';

const browser = PlatformDetection.detect().browser;

const isChild = (first: boolean, elm: Element): boolean => {
  const start = Element.fromDom(elm);
  const pointOp = first ? Arr.head : Arr.last;
  return Traverse.parent(start)
    .map((parent) => PredicateFilter.children(parent, (elm) => NodeType.isBogus(elm.dom()) === false))
    .bind(pointOp)
    .map((node) => Compare.eq(node, start))
    .getOr(false);
};

const isFirstChild = Fun.curry(isChild, true) as (elm: Element) => boolean;
const isLastChild = Fun.curry(isChild, false) as (elm: Element) => boolean;

const isCaretAtStartOrEndOfTable = (forward: boolean, rng: Range, table: Element): boolean => {
  const caretPos = CaretPosition.fromRangeStart(rng);
  return rng.collapsed && CaretFinder.positionIn(!forward, table).map((pos) => pos.isEqual(caretPos)).getOr(false);
};

const move = (editor, forward: boolean, table: Element): boolean => {
  const rng = editor.selection.getRng();
  const direction = forward ? 1 : -1;

  if (table && rng.collapsed && isCaretAtStartOrEndOfTable(forward, rng, table)) {
    const newRng = CefUtils.showCaret(direction, editor, table, !forward);
    editor.selection.setRng(newRng);
    return true;
  }

  return false;
};

const navigateHorizontally = (editor, forward: boolean): boolean => {
  const table = editor.dom.getParent(editor.selection.getNode(), 'table');
  return move(editor, forward, table);
};

const navigateVertially = (editor, down: boolean): boolean => {
  return Option.from(editor.dom.getParent(editor.selection.getNode(), 'table')).map((table) => {
    const firstOrLast = down ? isLastChild(table) : isFirstChild(table);
    return firstOrLast && move(editor, down, table);
  }).getOr(false);
};

const isTableNavigationBrowser = () => browser.isIE() || browser.isEdge() || browser.isFirefox();

const moveH = (editor, forward: boolean): () => boolean => {
  return () => {
    if (isTableNavigationBrowser()) {
      return navigateHorizontally(editor, forward);
    } else {
      return false;
    }
  };
};

const moveV = (editor, forward: boolean): () => boolean => {
  return () => {
    if (isTableNavigationBrowser()) {
      return navigateVertially(editor, forward);
    } else {
      return false;
    }
  };
};

export {
  isTableNavigationBrowser,
  moveH,
  moveV
};