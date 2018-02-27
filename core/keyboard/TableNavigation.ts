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
import { Arr, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { getPositionsAbove, findClosestHorizontalPositionFromPoint, getPositionsBelow, getPositionsUntilPreviousLine, getPositionsUntilNextLine, BreakType } from 'tinymce/core/caret/LineReader';
import { findClosestPositionInAboveCell, findClosestPositionInBelowCell } from 'tinymce/core/caret/TableCells';
import Fun from 'tinymce/core/util/Fun';

const browser = PlatformDetection.detect().browser;
const isFakeCaretTableBrowser = () => browser.isIE() || browser.isEdge() || browser.isFirefox();

const isAtTableCellLine = (getPositionsUntil, scope: HTMLElement, pos: CaretPosition) => {
  const lineInfo = getPositionsUntil(scope, pos);

  // Since we can't determine if the caret is on the above or below line in a word wrap break we asume it's always
  // on the below/above line based on direction. This will make the caret jump one line if you are at the end of the last
  // line and moving down or at the beginning of the second line moving up.
  if (lineInfo.breakType === BreakType.Wrap && lineInfo.positions.length === 0) {
    return lineInfo.breakAt.map((breakPos) => getPositionsUntil(scope, breakPos).breakAt.isNone()).getOr(true);
  } else {
    return lineInfo.breakAt.isNone();
  }
};

const isAtFirstTableCellLine = Fun.curry(isAtTableCellLine, getPositionsUntilPreviousLine) as (scope: HTMLElement, pos: CaretPosition) => boolean;
const isAtLastTableCellLine = Fun.curry(isAtTableCellLine, getPositionsUntilNextLine) as (scope: HTMLElement, pos: CaretPosition) => boolean;

const isCaretAtStartOrEndOfTable = (forward: boolean, rng: Range, table: Element): boolean => {
  const caretPos = CaretPosition.fromRangeStart(rng);
  return CaretFinder.positionIn(!forward, table).map((pos) => pos.isEqual(caretPos)).getOr(false);
};

const navigateHorizontally = (editor, forward: boolean, table: HTMLElement, td: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const direction = forward ? 1 : -1;

  if (isFakeCaretTableBrowser() && isCaretAtStartOrEndOfTable(forward, rng, table)) {
    const newRng = CefUtils.showCaret(direction, editor, table, !forward, true);
    editor.selection.setRng(newRng);
    return true;
  }

  return false;
};

const getClosestAbovePosition = (root: HTMLElement, table: HTMLElement, start: CaretPosition): CaretPosition => {
  return findClosestPositionInAboveCell(table, start).orThunk(
    () => {
      return Arr.head(start.getClientRects()).bind((rect) => {
        return findClosestHorizontalPositionFromPoint(getPositionsAbove(root, CaretPosition.before(table)), rect.left);
      });
    }
  ).getOr(CaretPosition.before(table));
};

const getClosestBelowPosition = (root: HTMLElement, table: HTMLElement, start: CaretPosition): CaretPosition => {
  return findClosestPositionInBelowCell(table, start).orThunk(
    () => {
      return Arr.head(start.getClientRects()).bind((rect) => {
        return findClosestHorizontalPositionFromPoint(getPositionsBelow(root, CaretPosition.after(table)), rect.left);
      });
    }
  ).getOr(CaretPosition.after(table));
};

const navigateVertically = (editor, down: boolean, table: HTMLElement, td: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (!down && isAtFirstTableCellLine(td, pos)) {
    const newPos = getClosestAbovePosition(root, table, pos);
    editor.selection.setRng(newPos.toRange());
    return true;
  } else if (down && isAtLastTableCellLine(td, pos)) {
    const newPos = getClosestBelowPosition(root, table, pos);
    editor.selection.setRng(newPos.toRange());
    return true;
  } else {
    return false;
  }
};

const moveH = (editor, forward: boolean): () => boolean => {
  return () => {
    return Option.from(editor.dom.getParent(editor.selection.getNode(), 'td,th')).bind((td) => {
      return Option.from(editor.dom.getParent(td, 'table')).map((table) => {
        return navigateHorizontally(editor, forward, table, td);
      });
    }).getOr(false);
  };
};

const moveV = (editor, forward: boolean): () => boolean => {
  return () => {
    return Option.from(editor.dom.getParent(editor.selection.getNode(), 'td,th')).bind((td) => {
      return Option.from(editor.dom.getParent(td, 'table')).map((table) => {
        return navigateVertically(editor, forward, table, td);
      });
    }).getOr(false);
  };
};

export {
  isFakeCaretTableBrowser,
  moveH,
  moveV
};