import { Arr, Fun, Optional } from '@ephox/katamari';
import { CellLocation, CellNavigation, TableLookup } from '@ephox/snooker';
import { Compare, ContentEditable, CursorPosition, Insert, SimSelection, SugarElement, SugarNode, WindowSelection } from '@ephox/sugar';

import Editor from '../api/Editor';
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
import * as ForceBlocks from '../ForceBlocks';
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
  return NodeType.isTable(node) ? Optional.some(node) : Optional.none();
};

const renderBlock = (down: boolean, editor: Editor, table: HTMLElement) => {
  editor.undoManager.transact(() => {
    const insertFn = down ? Insert.after : Insert.before;
    const rng = ForceBlocks.insertEmptyLine(editor, SugarElement.fromDom(table), insertFn);
    NavigationUtils.moveToRange(editor, rng);
  });
};

const moveCaret = (editor: Editor, down: boolean, pos: CaretPosition) => {
  const table = down ? getTable(true, pos) : getTable(false, pos);
  const last = down === false;

  table.fold(
    () => NavigationUtils.moveToRange(editor, pos.toRange()),
    (table) => CaretFinder.positionIn(last, editor.getBody()).filter((lastPos) => lastPos.isEqual(pos)).fold(
      () => NavigationUtils.moveToRange(editor, pos.toRange()),
      (_) => renderBlock(down, editor, table)
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

const moveH = (editor: Editor, forward: boolean): boolean => move(editor, forward, navigateHorizontally);

const moveV = (editor: Editor, forward: boolean): boolean => move(editor, forward, navigateVertically);

const getCellFirstCursorPosition = (cell: SugarElement<Node>): Range => {
  const selection = SimSelection.exact(cell, 0, cell, 0);
  return WindowSelection.toNative(selection);
};

const tabGo = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: CellLocation): Optional<Range> => {
  return cell.fold<Optional<Range>>(Optional.none, Optional.none, (_current, next) => {
    return CursorPosition.first(next).map((cell) => {
      return getCellFirstCursorPosition(cell);
    });
  }, (current) => {
    editor.execCommand('mceTableInsertRowAfter');
    // Move forward from the last cell so that we move into the first valid position in the new row
    return tabForward(editor, isRoot, current);
  });
};

const tabForward = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: SugarElement<HTMLTableCellElement>) =>
  tabGo(editor, isRoot, CellNavigation.next(cell, ContentEditable.isEditable));

const tabBackward = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: SugarElement<HTMLTableCellElement>) =>
  tabGo(editor, isRoot, CellNavigation.prev(cell, ContentEditable.isEditable));

const handleTab = (editor: Editor, forward: boolean): boolean => {
  const rootElements = [ 'table', 'li', 'dl' ];

  const body = SugarElement.fromDom(editor.getBody());
  const isRoot = (element: SugarElement<Node>) => {
    const name = SugarNode.name(element);
    return Compare.eq(element, body) || Arr.contains(rootElements, name);
  };

  const rng = editor.selection.getRng();
  // If navigating backwards, use the start of the ranged selection
  const container = SugarElement.fromDom(!forward ? rng.startContainer : rng.endContainer);
  return TableLookup.cell(container, isRoot).map((cell) => {
    // Clear fake ranged selection because our new selection will always be collapsed
    TableLookup.table(cell, isRoot).each((table) => {
      editor.model.table.clearSelectedCells(table.dom);
    });
    // Collapse selection to start or end based on shift key
    editor.selection.collapse(!forward);
    const navigation = !forward ? tabBackward : tabForward;
    const rng = navigation(editor, isRoot, cell);
    rng.each((range) => {
      editor.selection.setRng(range);
    });

    return true;
  }).getOr(false);
};

export {
  isFakeCaretTableBrowser,
  moveH,
  moveV,
  handleTab
};
