import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Compare, PredicateFind, Remove, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import Editor from '../api/Editor';
import { EditorEvent } from '../api/util/EventDispatcher';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isListItem, isTextBlock } from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as PaddingBr from '../dom/PaddingBr';
import * as InlineUtils from '../keyboard/InlineUtils';

const execCommandIgnoreInputEvents = (editor: Editor, command: string) => {
  // We need to prevent the input events from being fired by execCommand when delete is used internally
  const inputBlocker = (e: EditorEvent<InputEvent>) => e.stopImmediatePropagation();
  editor.on('beforeinput input', inputBlocker, true);
  editor.getDoc().execCommand(command);
  editor.off('beforeinput input', inputBlocker);
};

// ASSUMPTION: The editor command 'delete' doesn't have any `beforeinput` and `input` trapping
// because those events are only triggered by native contenteditable behaviour.
const execEditorDeleteCommand = (editor: Editor): void => {
  editor.execCommand('delete');
};

const execNativeDeleteCommand = (editor: Editor): void =>
  execCommandIgnoreInputEvents(editor, 'Delete');

const execNativeForwardDeleteCommand = (editor: Editor): void =>
  execCommandIgnoreInputEvents(editor, 'ForwardDelete');

const isBeforeRoot = (rootNode: SugarElement<Node>) => (elm: SugarElement<Node>): boolean =>
  Optionals.is(Traverse.parent(elm), rootNode, Compare.eq);

const isTextBlockOrListItem = (element: SugarElement<Node>): element is SugarElement<Element> =>
  isTextBlock(element) || isListItem(element);

const getParentBlock = (rootNode: SugarElement<Node>, elm: SugarElement<Node>): Optional<SugarElement<Element>> => {
  if (Compare.contains(rootNode, elm)) {
    return PredicateFind.closest(elm, isTextBlockOrListItem, isBeforeRoot(rootNode));
  } else {
    return Optional.none();
  }
};

const paddEmptyBody = (editor: Editor, moveSelection: boolean = true): void => {
  if (editor.dom.isEmpty(editor.getBody())) {
    editor.setContent('', { no_selection: !moveSelection });
  }
};

const willDeleteLastPositionInElement = (forward: boolean, fromPos: CaretPosition, elm: Node): boolean =>
  Optionals.lift2(
    CaretFinder.firstPositionIn(elm),
    CaretFinder.lastPositionIn(elm),
    (firstPos, lastPos): boolean => {
      const normalizedFirstPos = InlineUtils.normalizePosition(true, firstPos);
      const normalizedLastPos = InlineUtils.normalizePosition(false, lastPos);
      const normalizedFromPos = InlineUtils.normalizePosition(false, fromPos);

      if (forward) {
        return CaretFinder.nextPosition(elm, normalizedFromPos).exists((nextPos) =>
          nextPos.isEqual(normalizedLastPos) && fromPos.isEqual(normalizedFirstPos)
        );
      } else {
        return CaretFinder.prevPosition(elm, normalizedFromPos).exists((prevPos) =>
          prevPos.isEqual(normalizedFirstPos) && fromPos.isEqual(normalizedLastPos)
        );
      }
    }).getOr(true);

const freefallRtl = (root: SugarElement<Node>): Optional<SugarElement<Node>> => {
  const child = SugarNode.isComment(root) ? Traverse.prevSibling(root) : Traverse.lastChild(root);
  return child.bind(freefallRtl).orThunk(() => Optional.some(root));
};

const deleteRangeContents = (editor: Editor, rng: Range, root: SugarElement<HTMLElement>, moveSelection: boolean = true): void => {
  rng.deleteContents();
  // Pad the last block node
  const lastNode = freefallRtl(root).getOr(root);
  const lastBlock = SugarElement.fromDom(editor.dom.getParent(lastNode.dom, editor.dom.isBlock) ?? root.dom);
  // If the block is the editor body then we need to insert the root block as well
  if (lastBlock.dom === editor.getBody()) {
    paddEmptyBody(editor, moveSelection);
  } else if (Empty.isEmpty(lastBlock)) {
    PaddingBr.fillWithPaddingBr(lastBlock);
    if (moveSelection) {
      editor.selection.setCursorLocation(lastBlock.dom, 0);
    }
  }
  // Clean up any additional leftover nodes. If the last block wasn't a direct child, then we also need to clean up siblings
  if (!Compare.eq(root, lastBlock)) {
    const additionalCleanupNodes = Optionals.is(Traverse.parent(lastBlock), root) ? [] : Traverse.siblings(lastBlock);
    Arr.each(additionalCleanupNodes.concat(Traverse.children(root)), (node) => {
      if (!Compare.eq(node, lastBlock) && !Compare.contains(node, lastBlock) && Empty.isEmpty(node)) {
        Remove.remove(node);
      }
    });
  }
};

export {
  deleteRangeContents,
  execNativeDeleteCommand,
  execNativeForwardDeleteCommand,
  execEditorDeleteCommand,
  getParentBlock,
  paddEmptyBody,
  willDeleteLastPositionInElement
};
