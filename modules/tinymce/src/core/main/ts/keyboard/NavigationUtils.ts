import { Arr, Fun, Optional, Type } from '@ephox/katamari';

import type Editor from '../api/Editor';
import * as CaretContainer from '../caret/CaretContainer';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as CaretPositionPredicates from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import { CaretWalker, HDirection } from '../caret/CaretWalker';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';
import * as LineReader from '../caret/LineReader';
import * as LineUtils from '../caret/LineUtils';
import type { LinePosClientRect } from '../caret/LineWalker';
import * as LineWalker from '../caret/LineWalker';
import * as DetailsUtils from '../dom/DetailsUtils';
import * as NodeType from '../dom/NodeType';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import * as RangeNodes from '../selection/RangeNodes';
import * as ArrUtils from '../util/ArrUtils';

import { isCefAtEdgeSelected } from './CefUtils';
import * as InlineUtils from './InlineUtils';

const moveToRange = (editor: Editor, rng: Range): void => {
  editor.selection.setRng(rng);
  // Don't reuse the original range as TinyMCE will adjust it
  ScrollIntoView.scrollRangeIntoView(editor, editor.selection.getRng());
};

const renderRangeCaretOpt = (editor: Editor, range: Range, scrollIntoView: boolean): Optional<Range> =>
  Optional.some(FakeCaretUtils.renderRangeCaret(editor, range, scrollIntoView));

const getAbsPositionElement = (pos: CaretPosition, direction: HDirection) => {
  const node = pos.getNode(direction === HDirection.Backwards);
  return Type.isNonNullable(node) && CaretUtils.isAbsPositionedElement(node) ? Optional.some(node) : Optional.none();
};

const elementToRange = (editor: Editor, node: Node) => {
  const rng = editor.dom.createRng();
  rng.selectNode(node);
  return rng;
};

const moveHorizontally = (editor: Editor, direction: HDirection, range: Range, isBefore: (caretPosition: CaretPosition) => boolean,
                          isAfter: (caretPosition: CaretPosition) => boolean, isElement: (node: Node | null) => node is HTMLElement): Optional<Range> => {
  const forwards = direction === HDirection.Forwards;
  const caretWalker = CaretWalker(editor.getBody());
  const getNextPosFn = Fun.curry(CaretUtils.getVisualCaretPosition, forwards ? caretWalker.next : caretWalker.prev);
  const isBeforeFn = forwards ? isBefore : isAfter;
  const dom = editor.dom;

  if (!range.collapsed) {
    const node = RangeNodes.getSelectedNode(range);
    if (isElement(node)) {

      if (CaretUtils.isAbsPositionedElement(node)) {
        const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
        return Optional.from(getNextPosFn(caretPosition)).map((next) => next.toRange());
      } else {
        return FakeCaretUtils.showCaret(direction, editor, node, direction === HDirection.Backwards, false);
      }
    } else if (isCefAtEdgeSelected(editor)) {
      const newRange = range.cloneRange();
      newRange.collapse(direction === HDirection.Backwards);
      return Optional.from(newRange);
    }
  }

  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  if (isBeforeFn(caretPosition)) {
    return FakeCaretUtils.selectNode(editor, caretPosition.getNode(!forwards) as Element);
  }

  let nextCaretPosition = getNextPosFn(caretPosition);
  const rangeIsInContainerBlock = CaretContainer.isRangeInCaretContainerBlock(range);
  if (!nextCaretPosition) {
    const tryingLeaveDetails = DetailsUtils.getClosestDetails(dom, caretPosition.container());
    if (tryingLeaveDetails.isSome()) {
      return tryingLeaveDetails.bind((details) => FakeCaretUtils.showCaret(direction, editor, details, !forwards, false));
    } else {
      return rangeIsInContainerBlock ? Optional.some(range) : Optional.none();
    }
  } else {
    nextCaretPosition = InlineUtils.normalizePosition(forwards, nextCaretPosition);
  }

  const leavingDetails = DetailsUtils.getClosestDetails(dom, caretPosition.container()).filter((details) =>
    NodeType.isDetails(forwards ? details.nextSibling : details.previousSibling) && !details.contains(nextCaretPosition.container()));
  if (leavingDetails.isSome()) {
    return leavingDetails.bind((details) => FakeCaretUtils.showCaret(direction, editor, details, !forwards, false));
  }

  if (isBeforeFn(nextCaretPosition)) {
    return getAbsPositionElement(nextCaretPosition, direction).fold(
      () => FakeCaretUtils.showCaret(direction, editor, nextCaretPosition?.getNode(!forwards) as HTMLElement, forwards, false),
      (el) => Optional.some(elementToRange(editor, el))
    );
  }

  // Peek ahead for handling of ab|c<span cE=false> -> abc|<span cE=false>
  const peekCaretPosition = getNextPosFn(nextCaretPosition);
  if (peekCaretPosition && isBeforeFn(peekCaretPosition)) {
    if (CaretUtils.isMoveInsideSameBlock(nextCaretPosition, peekCaretPosition)) {
      return getAbsPositionElement(nextCaretPosition, direction).fold(
        () => FakeCaretUtils.showCaret(direction, editor, peekCaretPosition.getNode(!forwards) as HTMLElement, forwards, false),
        (el) => Optional.some(elementToRange(editor, el))
      );
    }
  }

  if (rangeIsInContainerBlock) {
    return renderRangeCaretOpt(editor, nextCaretPosition.toRange(), false);
  }

  return Optional.none();
};

// Closed: end of the summary; open: end of the content, or of the last visible position of a trailing nested details
const getLastVisiblePositionIn = (details: HTMLDetailsElement): Optional<CaretPosition> => {
  const lastChild = details.lastChild;
  if (!details.open) {
    return Optional.from(details.firstElementChild).bind(CaretFinder.lastPositionIn);
  }
  return NodeType.isDetails(lastChild) ? getLastVisiblePositionIn(lastChild) : CaretFinder.lastPositionIn(details);
};

const getVisiblePositionIn = (forwards: boolean, details: HTMLDetailsElement): Optional<CaretPosition> =>
  forwards ? CaretFinder.firstPositionIn(details) : getLastVisiblePositionIn(details);

const getPositionBeyond = (forwards: boolean, root: HTMLElement, node: Node): Optional<CaretPosition> => {
  const sibling = forwards ? node.nextSibling : node.previousSibling;
  return NodeType.isDetails(sibling)
    ? getVisiblePositionIn(forwards, sibling)
    : CaretFinder.navigate(forwards, root, forwards ? CaretPosition.after(node) : CaretPosition.before(node));
};

// From a fake caret beside a details (normalized to before/after it): move into the details or past its caret block.
// If there is nowhere to move to, the fake caret is kept in place.
const moveVerticallyBesideDetails = (editor: Editor, forwards: boolean, range: Range, caretPosition: CaretPosition): Optional<Range> => {
  const before = CaretPositionPredicates.isBeforeDetails(caretPosition);
  if (!before && !CaretPositionPredicates.isAfterDetails(caretPosition)) {
    return Optional.none();
  }

  const details = caretPosition.getNode(!before) as HTMLDetailsElement;
  const sibling = forwards ? details.nextSibling : details.previousSibling;
  const block = CaretContainer.isCaretContainerBlock(sibling) ? sibling : details;
  const target = before === forwards ? getVisiblePositionIn(forwards, details) : getPositionBeyond(forwards, editor.getBody(), block);

  return target.fold(() => Optional.some(range), (pos) => renderRangeCaretOpt(editor, pos.toRange(), false));
};

const moveVertically = (editor: Editor, direction: LineWalker.VDirection, range: Range, isBefore: (caretPosition: CaretPosition) => boolean,
                        isAfter: (caretPosition: CaretPosition) => boolean, isElement: (node: Node) => node is HTMLElement): Optional<Range> => {
  const caretPosition = CaretUtils.getNormalizedRangeEndPoint(direction, editor.getBody(), range);
  const caretClientRect = ArrUtils.last(caretPosition.getClientRects());
  const forwards = direction === LineWalker.VDirection.Down;
  const root = editor.getBody();

  if (!caretClientRect) {
    return moveVerticallyBesideDetails(editor, forwards, range, caretPosition);
  }

  if (isCefAtEdgeSelected(editor)) {
    const caretPosition = forwards ? CaretPosition.fromRangeEnd(range) : CaretPosition.fromRangeStart(range);
    const getClosestFn = !forwards ? LineReader.getClosestPositionAbove : LineReader.getClosestPositionBelow;
    return getClosestFn(root, caretPosition)
      .orThunk(() => Optional.from(caretPosition))
      .map((pos) => pos.toRange());
  }

  const walkerFn = forwards ? LineWalker.downUntil : LineWalker.upUntil;
  const linePositions = walkerFn(root, LineWalker.isAboveLine(1), caretPosition);
  const nextLinePositions = Arr.filter(linePositions, LineWalker.isLine(1));

  const clientX = caretClientRect.left;
  const nextLineRect = LineUtils.findClosestClientRect(nextLinePositions, clientX);
  if (nextLineRect && isElement(nextLineRect.node)) {
    const dist1 = Math.abs(clientX - nextLineRect.left);
    const dist2 = Math.abs(clientX - nextLineRect.right);

    return FakeCaretUtils.showCaret(direction, editor, nextLineRect.node, dist1 < dist2, false);
  }

  let currentNode;
  if (isBefore(caretPosition)) {
    currentNode = caretPosition.getNode();
  } else if (isAfter(caretPosition)) {
    currentNode = caretPosition.getNode(true);
  } else {
    currentNode = RangeNodes.getSelectedNode(range);
  }

  if (currentNode) {
    const caretPositions = LineWalker.positionsUntil(direction, root, LineWalker.isAboveLine(1), currentNode);

    let closestNextLineRect: LinePosClientRect | undefined = LineUtils.findClosestClientRect(Arr.filter(caretPositions, LineWalker.isLine(1)), clientX);
    if (closestNextLineRect) {
      return renderRangeCaretOpt(editor, closestNextLineRect.position.toRange(), false);
    }

    closestNextLineRect = ArrUtils.last(Arr.filter(caretPositions, LineWalker.isLine(0)));
    if (closestNextLineRect) {
      return renderRangeCaretOpt(editor, closestNextLineRect.position.toRange(), false);
    }
  }

  if (nextLinePositions.length === 0) {
    return getLineEndPoint(editor, forwards).filter(forwards ? isAfter : isBefore)
      .map((pos) => FakeCaretUtils.renderRangeCaret(editor, pos.toRange(), false));
  }

  return Optional.none();
};

const getLineEndPoint = (editor: Editor, forward: boolean): Optional<CaretPosition> => {
  const rng = editor.selection.getRng();
  const from = forward ? CaretPosition.fromRangeEnd(rng) : CaretPosition.fromRangeStart(rng);
  const host = CaretUtils.getEditingHost(from.container(), editor.getBody());

  if (forward) {
    const lineInfo = LineReader.getPositionsUntilNextLine(host, from);
    return Arr.last(lineInfo.positions);
  } else {
    const lineInfo = LineReader.getPositionsUntilPreviousLine(host, from);
    return Arr.head(lineInfo.positions);
  }
};

const moveToLineEndPoint = (editor: Editor, forward: boolean, isElementPosition: (pos: CaretPosition) => boolean): boolean =>
  getLineEndPoint(editor, forward).filter(isElementPosition).exists((pos) => {
    editor.selection.setRng(pos.toRange());
    return true;
  });

export {
  getLineEndPoint,
  moveHorizontally,
  moveVertically,
  moveToLineEndPoint,
  moveToRange
};

