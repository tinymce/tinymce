import { Optional } from '@ephox/katamari';

import type Editor from '../api/Editor';
import Env from '../api/Env';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as LineReader from '../caret/LineReader';
import * as NodeType from '../dom/NodeType';

import * as NavigationUtils from './NavigationUtils';

const moveUp = (editor: Editor, details: HTMLDetailsElement, summary: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.firstChild === details && LineReader.isAtFirstLine(summary, pos)) {
    editor.execCommand('InsertNewBlockBefore');
    return true;
  } else {
    return false;
  }
};

const moveDown = (editor: Editor, details: HTMLDetailsElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.lastChild === details && LineReader.isAtLastLine(details, pos)) {
    editor.execCommand('InsertNewBlockAfter');
    return true;
  } else {
    return false;
  }
};

const move = (editor: Editor, forward: boolean) => {
  if (forward) {
    return Optional.from(editor.dom.getParent<HTMLDetailsElement>(editor.selection.getNode(), 'details'))
      .map((details) => moveDown(editor, details))
      .getOr(false);
  } else {
    return Optional.from(editor.dom.getParent<HTMLElement>(editor.selection.getNode(), 'summary'))
      .bind((summary) => Optional.from(editor.dom.getParent(summary, 'details'))
        .map((details) => moveUp(editor, details, summary))
      ).getOr(false);
  }
};

// A real trailing <br> does not start a new line, so a caret before it is still on the last line of the scope
const isAtLastLineIgnoringTrailingBr = (scope: HTMLElement, pos: CaretPosition): boolean =>
  LineReader.getPositionsUntilNextLine(scope, pos).breakAt.forall((breakPos) => {
    const br = breakPos.getNode(false);
    return NodeType.isBr(br) && CaretFinder.nextPosition(scope, CaretPosition.after(br)).isNone();
  });

// A closed details only shows its summary, and the first line of a details is the first line of its summary
const getSummary = (details: HTMLDetailsElement): Optional<HTMLElement> =>
  Optional.from(details.firstElementChild).filter(NodeType.isSummary);

const getLastVisibleBlock = (details: HTMLDetailsElement): Optional<HTMLElement> => {
  const lastChild = details.lastElementChild;
  if (!details.open) {
    return getSummary(details);
  } else if (NodeType.isDetails(lastChild)) {
    return getLastVisibleBlock(lastChild);
  } else {
    return Optional.from(lastChild).filter(NodeType.isHTMLElement);
  }
};

const isOpenDetails = (node: Node | null): node is HTMLDetailsElement =>
  NodeType.isDetails(node) && node.open;

const moveToClosestPosition = (editor: Editor, pos: CaretPosition, positions: CaretPosition[]): boolean =>
  LineReader.findClosestHorizontalPosition(positions, pos)
    .filter((target) => editor.dom.isEditable(target.container()))
    .map((target) => {
      NavigationUtils.moveToRange(editor, target.toRange());
      return true;
    })
    .getOr(false);

// Gecko skips the body of an open details when moving down from its summary
const moveDownFirefox = (editor: Editor, node: Node, pos: CaretPosition): boolean =>
  Optional.from(editor.dom.getParent<HTMLElement>(node, 'summary'))
    .filter((summary) => isOpenDetails(summary.parentNode) && isAtLastLineIgnoringTrailingBr(summary, pos))
    .bind((summary) => Optional.from(summary.nextElementSibling))
    .filter(NodeType.isHTMLElement)
    .filter((next) => !NodeType.isTable(next))
    .bind((next) => NodeType.isDetails(next) ? getSummary(next) : Optional.some(next))
    .map((target) => moveToClosestPosition(editor, pos, LineReader.getFirstLinePositions(target)))
    .getOr(false);

// Gecko skips the body of an open details, or the summary of a closed one, when moving up into it from the block after it
const moveUpFirefox = (editor: Editor, node: Node, pos: CaretPosition): boolean => {
  const root = editor.getBody();
  return Optional.from(editor.dom.getParent<HTMLElement>(node, editor.dom.isBlock, root))
    .filter((block) => block !== root && LineReader.isAtFirstLine(block, pos))
    .map((block) => NodeType.isSummary(block) && NodeType.isDetails(block.parentNode) ? block.parentNode : block)
    .map((anchor) => anchor.previousSibling)
    .filter(NodeType.isDetails)
    .bind(getLastVisibleBlock)
    .map((target) => moveToClosestPosition(editor, pos, LineReader.getLastLinePositions(target)))
    .getOr(false);
};

// A plain arrow over a range moves from the selection focus (the extended end), so move from there as the browser does
const moveFirefox = (editor: Editor, forward: boolean): boolean =>
  Optional.from(editor.selection.getSel())
    .bind((sel) => Optional.from(sel.focusNode).map((focusNode) => ({ focusNode, pos: CaretPosition(focusNode, sel.focusOffset) })))
    .map(({ focusNode, pos }) => forward ? moveDownFirefox(editor, focusNode, pos) : moveUpFirefox(editor, focusNode, pos))
    .getOr(false);

const moveV = (editor: Editor, forward: boolean): boolean =>
  move(editor, forward) || (Env.browser.isFirefox() && moveFirefox(editor, forward));

export {
  moveV
};
