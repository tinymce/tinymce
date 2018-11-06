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
import { isFakeCaretTableBrowser } from '../caret/FakeCaret';
import * as CefUtils from '../keyboard/CefUtils';
import { Arr, Option } from '@ephox/katamari';
import { getPositionsAbove, findClosestHorizontalPositionFromPoint, getPositionsBelow, getPositionsUntilPreviousLine, getPositionsUntilNextLine, BreakType, LineInfo } from 'tinymce/core/caret/LineReader';
import { findClosestPositionInAboveCell, findClosestPositionInBelowCell } from 'tinymce/core/caret/TableCells';
import Fun from 'tinymce/core/util/Fun';
import ScrollIntoView from 'tinymce/core/dom/ScrollIntoView';
import { Editor } from 'tinymce/core/api/Editor';
import NodeType from 'tinymce/core/dom/NodeType';
import Settings from 'tinymce/core/api/Settings';
import { Element as SugarElement, Attr, Insert } from '@ephox/sugar';
import { HTMLElement, Range, Element } from '@ephox/dom-globals';

const moveToRange = (editor: Editor, rng: Range) => {
  editor.selection.setRng(rng);
  ScrollIntoView.scrollRangeIntoView(editor, rng);
};

const hasNextBreak = (getPositionsUntil, scope: HTMLElement, lineInfo: LineInfo): boolean => {
  return lineInfo.breakAt.map((breakPos) => getPositionsUntil(scope, breakPos).breakAt.isSome()).getOr(false);
};

const startsWithWrapBreak = (lineInfo: LineInfo) => lineInfo.breakType === BreakType.Wrap && lineInfo.positions.length === 0;

const startsWithBrBreak = (lineInfo: LineInfo) => lineInfo.breakType === BreakType.Br && lineInfo.positions.length === 1;

const isAtTableCellLine = (getPositionsUntil, scope: HTMLElement, pos: CaretPosition) => {
  const lineInfo = getPositionsUntil(scope, pos);

  // Since we can't determine if the caret is on the above or below line in a word wrap break we asume it's always
  // on the below/above line based on direction. This will make the caret jump one line if you are at the end of the last
  // line and moving down or at the beginning of the second line moving up.
  if (startsWithWrapBreak(lineInfo) || (!NodeType.isBr(pos.getNode()) && startsWithBrBreak(lineInfo))) {
    return !hasNextBreak(getPositionsUntil, scope, lineInfo);
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
    moveToRange(editor, newRng);
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

const getTable = (previous: boolean, pos: CaretPosition): Option<HTMLElement> => {
  const node = pos.getNode(previous);
  return NodeType.isElement(node) && node.nodeName === 'TABLE' ? Option.some(node as HTMLElement) : Option.none();
};

const renderBlock = (down: boolean, editor: Editor, table: HTMLElement, pos: CaretPosition) => {
  const forcedRootBlock = Settings.getForcedRootBlock(editor);

  if (forcedRootBlock) {
    editor.undoManager.transact(() => {
      const element = SugarElement.fromTag(forcedRootBlock);
      Attr.setAll(element, Settings.getForcedRootBlockAttrs(editor));
      Insert.append(element, SugarElement.fromTag('br'));

      if (down) {
        Insert.after(SugarElement.fromDom(table), element);
      } else {
        Insert.before(SugarElement.fromDom(table), element);
      }

      const rng = editor.dom.createRng();
      rng.setStart(element.dom(), 0);
      rng.setEnd(element.dom(), 0);
      moveToRange(editor, rng);
    });
  } else {
    moveToRange(editor, pos.toRange());
  }
};

const moveCaret = (editor: Editor, down: boolean, pos: CaretPosition) => {
  const table = down ? getTable(true, pos) : getTable(false, pos);
  const last = down === false;

  table.fold(
    () => moveToRange(editor, pos.toRange()),
    (table) => {
      return CaretFinder.positionIn(last, editor.getBody()).filter((lastPos) => lastPos.isEqual(pos)).fold(
        () => moveToRange(editor, pos.toRange()),
        (_) => renderBlock(down, editor, table, pos)
      );
    }
  );
};

const navigateVertically = (editor, down: boolean, table: HTMLElement, td: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (!down && isAtFirstTableCellLine(td, pos)) {
    const newPos = getClosestAbovePosition(root, table, pos);
    moveCaret(editor, down, newPos);
    return true;
  } else if (down && isAtLastTableCellLine(td, pos)) {
    const newPos = getClosestBelowPosition(root, table, pos);
    moveCaret(editor, down, newPos);
    return true;
  } else {
    return false;
  }
};

const moveH = (editor, forward: boolean) => () => {
  return Option.from(editor.dom.getParent(editor.selection.getNode(), 'td,th')).bind((td) => {
    return Option.from(editor.dom.getParent(td, 'table')).map((table) => {
      return navigateHorizontally(editor, forward, table, td);
    });
  }).getOr(false);
};

const moveV = (editor, forward: boolean) => () => {
  return Option.from(editor.dom.getParent(editor.selection.getNode(), 'td,th')).bind((td) => {
    return Option.from(editor.dom.getParent(td, 'table')).map((table) => {
      return navigateVertically(editor, forward, table, td);
    });
  }).getOr(false);
};

export {
  moveH,
  moveV
};