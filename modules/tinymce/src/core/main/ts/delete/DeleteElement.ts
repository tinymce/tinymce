import { Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Insert, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import * as CaretCandidate from '../caret/CaretCandidate';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as FormatUtils from '../fmt/FormatUtils';
import * as MergeText from './MergeText';

const needsReposition = (pos: CaretPosition, elm: Node): boolean => {
  const container = pos.container();
  const offset = pos.offset();
  return !CaretPosition.isTextPosition(pos) && container === elm.parentNode && offset > CaretPosition.before(elm).offset();
};

const reposition = (elm: Node, pos: CaretPosition): CaretPosition =>
  needsReposition(pos, elm) ? CaretPosition(pos.container(), pos.offset() - 1) : pos;

const beforeOrStartOf = (node: Node): CaretPosition =>
  NodeType.isText(node) ? CaretPosition(node, 0) : CaretPosition.before(node);

const afterOrEndOf = (node: Node): CaretPosition =>
  NodeType.isText(node) ? CaretPosition(node, node.data.length) : CaretPosition.after(node);

const getPreviousSiblingCaretPosition = (elm: Node): Optional<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.previousSibling)) {
    return Optional.some(afterOrEndOf(elm.previousSibling));
  } else {
    return elm.previousSibling ? CaretFinder.lastPositionIn(elm.previousSibling) : Optional.none();
  }
};

const getNextSiblingCaretPosition = (elm: Node): Optional<CaretPosition> => {
  if (CaretCandidate.isCaretCandidate(elm.nextSibling)) {
    return Optional.some(beforeOrStartOf(elm.nextSibling));
  } else {
    return elm.nextSibling ? CaretFinder.firstPositionIn(elm.nextSibling) : Optional.none();
  }
};

const findCaretPositionBackwardsFromElm = (rootElement: Node, elm: Node): Optional<CaretPosition> => {
  return Optional.from(elm.previousSibling ? elm.previousSibling : elm.parentNode)
    .bind((node) => CaretFinder.prevPosition(rootElement, CaretPosition.before(node)))
    .orThunk(() => CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)));
};

const findCaretPositionForwardsFromElm = (rootElement: Node, elm: Node): Optional<CaretPosition> =>
  CaretFinder.nextPosition(rootElement, CaretPosition.after(elm)).orThunk(
    () => CaretFinder.prevPosition(rootElement, CaretPosition.before(elm))
  );

const findCaretPositionBackwards = (rootElement: Node, elm: Node): Optional<CaretPosition> =>
  getPreviousSiblingCaretPosition(elm).orThunk(() => getNextSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionBackwardsFromElm(rootElement, elm));

const findCaretPositionForward = (rootElement: Node, elm: Node): Optional<CaretPosition> =>
  getNextSiblingCaretPosition(elm)
    .orThunk(() => getPreviousSiblingCaretPosition(elm))
    .orThunk(() => findCaretPositionForwardsFromElm(rootElement, elm));

const findCaretPosition = (forward: boolean, rootElement: Node, elm: Node): Optional<CaretPosition> =>
  forward ? findCaretPositionForward(rootElement, elm) : findCaretPositionBackwards(rootElement, elm);

const findCaretPosOutsideElmAfterDelete = (forward: boolean, rootElement: Node, elm: Node): Optional<CaretPosition> =>
  findCaretPosition(forward, rootElement, elm).map(Fun.curry(reposition, elm));

const setSelection = (editor: Editor, forward: boolean, pos: Optional<CaretPosition>): void => {
  pos.fold(
    () => {
      editor.focus();
    },
    (pos) => {
      editor.selection.setRng(pos.toRange(), forward);
    }
  );
};

const eqRawNode = (rawNode: Node) => (elm: SugarElement<Node>): boolean =>
  elm.dom === rawNode;

const isBlock = (editor: Editor, elm: SugarElement<Node>): boolean =>
  elm && Obj.has(editor.schema.getBlockElements(), SugarNode.name(elm));

const paddEmptyBlock = (elm: SugarElement<Node>, preserveEmptyCaret: boolean): Optional<CaretPosition> => {
  if (Empty.isEmpty(elm)) {
    const br = SugarElement.fromHtml('<br data-mce-bogus="1">');
    // Remove all bogus elements except caret
    if (preserveEmptyCaret) {
      Arr.each(Traverse.children(elm), (node) => {
        if (!FormatUtils.isEmptyCaretFormatElement(node)) {
          Remove.remove(node);
        }
      });
    } else {
      Remove.empty(elm);
    }
    Insert.append(elm, br);
    return Optional.some(CaretPosition.before(br.dom));
  } else {
    return Optional.none();
  }
};

const deleteNormalized = (elm: SugarElement<Node>, afterDeletePosOpt: Optional<CaretPosition>, schema: Schema, normalizeWhitespace?: boolean): Optional<CaretPosition> => {
  const prevTextOpt = Traverse.prevSibling(elm).filter(SugarNode.isText);
  const nextTextOpt = Traverse.nextSibling(elm).filter(SugarNode.isText);

  // Delete the element
  Remove.remove(elm);

  // Merge and normalize any prev/next text nodes, so that they are merged and don't lose meaningful whitespace
  // eg. <p>a <span></span> b</p> -> <p>a &nsbp;b</p> or <p><span></span> a</p> -> <p>&nbsp;a</a>
  return Optionals.lift3(prevTextOpt, nextTextOpt, afterDeletePosOpt, (prev, next, pos) => {
    const prevNode = prev.dom, nextNode = next.dom;
    const offset = prevNode.data.length;
    MergeText.mergeTextNodes(prevNode, nextNode, schema, normalizeWhitespace);
    // Update the cursor position if required
    return pos.container() === nextNode ? CaretPosition(prevNode, offset) : pos;
  }).orThunk(() => {
    if (normalizeWhitespace) {
      prevTextOpt.each((elm) => MergeText.normalizeWhitespaceBefore(elm.dom, elm.dom.length, schema));
      nextTextOpt.each((elm) => MergeText.normalizeWhitespaceAfter(elm.dom, 0, schema));
    }
    return afterDeletePosOpt;
  });
};

const isInlineElement = (editor: Editor, element: SugarElement<Node>): boolean =>
  Obj.has(editor.schema.getTextInlineElements(), SugarNode.name(element));

const deleteElement = (
  editor: Editor,
  forward: boolean,
  elm: SugarElement<Node>,
  moveCaret: boolean = true,
  preserveEmptyCaret: boolean = false
): void => {
  // Existing delete logic
  const afterDeletePos = findCaretPosOutsideElmAfterDelete(forward, editor.getBody(), elm.dom);
  const parentBlock = PredicateFind.ancestor(elm, Fun.curry(isBlock, editor), eqRawNode(editor.getBody()));
  const normalizedAfterDeletePos = deleteNormalized(elm, afterDeletePos, editor.schema, isInlineElement(editor, elm));

  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('');
    editor.selection.setCursorLocation();
  } else {
    parentBlock.bind((elm) => paddEmptyBlock(elm, preserveEmptyCaret)).fold(
      () => {
        if (moveCaret) {
          setSelection(editor, forward, normalizedAfterDeletePos);
        }
      },
      (paddPos) => {
        if (moveCaret) {
          setSelection(editor, forward, Optional.some(paddPos));
        }
      }
    );
  }
};

export {
  deleteElement
};