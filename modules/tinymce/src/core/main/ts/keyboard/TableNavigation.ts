/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Optional } from '@ephox/katamari';
import { Attribute, Insert, SugarElement } from '@ephox/sugar';
import Editor from '../api/Editor';
import * as Settings from '../api/Settings';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isFakeCaretTableBrowser } from '../caret/FakeCaret';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';
import {
  BreakType, findClosestHorizontalPositionFromPoint, getPositionsAbove, getPositionsBelow, getPositionsUntilNextLine, getPositionsUntilPreviousLine,
  LineInfo
} from '../caret/LineReader';
import { findClosestPositionInAboveCell, findClosestPositionInBelowCell } from '../caret/TableCells';
import * as NodeType from '../dom/NodeType';
import * as NavigationUtils from './NavigationUtils';

type PositionsUntilFn = (scope: HTMLElement, start: CaretPosition) => LineInfo;

const hasNextBreak = (getPositionsUntil: PositionsUntilFn, scope: HTMLElement, lineInfo: LineInfo): boolean =>
  lineInfo.breakAt.exists((breakPos) => getPositionsUntil(scope, breakPos).breakAt.isSome());

const startsWithWrapBreak = (lineInfo: LineInfo) => lineInfo.breakType === BreakType.Wrap && lineInfo.positions.length === 0;

const startsWithBrBreak = (lineInfo: LineInfo) => lineInfo.breakType === BreakType.Br && lineInfo.positions.length === 1;

const isAtTableCellLine = (getPositionsUntil: PositionsUntilFn, scope: HTMLElement, pos: CaretPosition) => {
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

const isAtFirstTableCellLine = Fun.curry(isAtTableCellLine, getPositionsUntilPreviousLine);
const isAtLastTableCellLine = Fun.curry(isAtTableCellLine, getPositionsUntilNextLine);

const isCaretAtStartOrEndOfTable = (forward: boolean, rng: Range, table: Element): boolean => {
  const caretPos = CaretPosition.fromRangeStart(rng);
  return CaretFinder.positionIn(!forward, table).exists((pos) => pos.isEqual(caretPos));
};

const navigateHorizontally = (editor: Editor, forward: boolean, table: HTMLElement, _td: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const direction = forward ? 1 : -1;

  if (isFakeCaretTableBrowser() && isCaretAtStartOrEndOfTable(forward, rng, table)) {
    FakeCaretUtils.showCaret(direction, editor, table, !forward, false).each((newRng) => {
      NavigationUtils.moveToRange(editor, newRng);
    });
    return true;
  }

  return false;
};

const getClosestAbovePosition = (root: HTMLElement, table: HTMLElement, start: CaretPosition): CaretPosition => findClosestPositionInAboveCell(table, start).orThunk(
  () => Arr.head(start.getClientRects()).bind((rect) => findClosestHorizontalPositionFromPoint(getPositionsAbove(root, CaretPosition.before(table)), rect.left))
).getOr(CaretPosition.before(table));

const getClosestBelowPosition = (root: HTMLElement, table: HTMLElement, start: CaretPosition): CaretPosition => findClosestPositionInBelowCell(table, start).orThunk(
  () => Arr.head(start.getClientRects()).bind((rect) => findClosestHorizontalPositionFromPoint(getPositionsBelow(root, CaretPosition.after(table)), rect.left))
).getOr(CaretPosition.after(table));

const getTable = (previous: boolean, pos: CaretPosition): Optional<HTMLElement> => {
  const node = pos.getNode(previous);
  return NodeType.isElement(node) && node.nodeName === 'TABLE' ? Optional.some(node) : Optional.none();
};

const renderBlock = (down: boolean, editor: Editor, table: HTMLElement, pos: CaretPosition) => {
  const forcedRootBlock = Settings.getForcedRootBlock(editor);

  if (forcedRootBlock) {
    editor.undoManager.transact(() => {
      const element = SugarElement.fromTag(forcedRootBlock);
      Attribute.setAll(element, Settings.getForcedRootBlockAttrs(editor));
      Insert.append(element, SugarElement.fromTag('br'));

      if (down) {
        Insert.after(SugarElement.fromDom(table), element);
      } else {
        Insert.before(SugarElement.fromDom(table), element);
      }

      const rng = editor.dom.createRng();
      rng.setStart(element.dom, 0);
      rng.setEnd(element.dom, 0);
      NavigationUtils.moveToRange(editor, rng);
    });
  } else {
    NavigationUtils.moveToRange(editor, pos.toRange());
  }
};

const moveCaret = (editor: Editor, down: boolean, pos: CaretPosition) => {
  const table = down ? getTable(true, pos) : getTable(false, pos);
  const last = down === false;

  table.fold(
    () => NavigationUtils.moveToRange(editor, pos.toRange()),
    (table) => CaretFinder.positionIn(last, editor.getBody()).filter((lastPos) => lastPos.isEqual(pos)).fold(
      () => NavigationUtils.moveToRange(editor, pos.toRange()),
      (_) => renderBlock(down, editor, table, pos)
    )
  );
};

const navigateVertically = (editor: Editor, down: boolean, table: HTMLElement, td: HTMLElement): boolean => {
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

const move = (editor: Editor, forward: boolean, mover: (editor: Editor, forward: boolean, table: HTMLTableElement, td: HTMLTableCellElement) => boolean) =>
  Optional.from(editor.dom.getParent<HTMLTableCellElement>(editor.selection.getNode(), 'td,th'))
    .bind((td) => Optional.from(editor.dom.getParent(td, 'table'))
      .map((table) => mover(editor, forward, table, td))
    ).getOr(false);

const moveH = (editor: Editor, forward: boolean) => move(editor, forward, navigateHorizontally);

const moveV = (editor: Editor, forward: boolean) => move(editor, forward, navigateVertically);

export {
  isFakeCaretTableBrowser,
  moveH,
  moveV
};
