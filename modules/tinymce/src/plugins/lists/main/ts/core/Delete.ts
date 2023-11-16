import { Arr, Optional, Optionals } from '@ephox/katamari';
import { Compare, ContentEditable, PredicateFind, Remove, SugarElement, SugarNode } from '@ephox/sugar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import { flattenListSelection, outdentListSelection } from '../actions/Indendation';
import * as ToggleList from '../actions/ToggleList';
import * as Bookmark from './Bookmark';
import * as NodeType from './NodeType';
import * as NormalizeLists from './NormalizeLists';
import * as ListRangeUtils from './RangeUtils';
import * as Selection from './Selection';
import { isWithinNonEditableList } from './Util';

const findNextCaretContainer = (editor: Editor, rng: Range, isForward: boolean, root: Node): Node | null => {
  let node: Node | null | undefined = rng.startContainer;
  const offset = rng.startOffset;

  if (NodeType.isTextNode(node) && (isForward ? offset < node.data.length : offset > 0)) {
    return node;
  }

  const nonEmptyBlocks = editor.schema.getNonEmptyElements();
  if (NodeType.isElement(node)) {
    node = RangeUtils.getNode(node, offset);
  }

  const walker = new DomTreeWalker(node, root);

  // Delete at <li>|<br></li> then jump over the bogus br
  if (isForward) {
    if (NodeType.isBogusBr(editor.dom, node)) {
      walker.next();
    }
  }

  const walkFn = isForward ? walker.next.bind(walker) : walker.prev2.bind(walker);
  while ((node = walkFn())) {
    if (node.nodeName === 'LI' && !node.hasChildNodes()) {
      return node;
    }

    if (nonEmptyBlocks[node.nodeName]) {
      return node;
    }

    if (NodeType.isTextNode(node) && node.data.length > 0) {
      return node;
    }
  }

  return null;
};

const hasOnlyOneBlockChild = (dom: DOMUtils, elm: Element): boolean => {
  const childNodes = elm.childNodes;
  return childNodes.length === 1 && !NodeType.isListNode(childNodes[0]) && dom.isBlock(childNodes[0]);
};

const isUnwrappable = (node: Node | null): node is HTMLElement =>
  Optional.from(node)
    .map(SugarElement.fromDom)
    .filter(SugarNode.isHTMLElement)
    .exists((el) => ContentEditable.isEditable(el) && !Arr.contains([ 'details' ], SugarNode.name(el)));

const unwrapSingleBlockChild = (dom: DOMUtils, elm: Element): void => {
  if (hasOnlyOneBlockChild(dom, elm) && isUnwrappable(elm.firstChild)) {
    dom.remove(elm.firstChild, true);
  }
};

const moveChildren = (dom: DOMUtils, fromElm: Element, toElm: Element): void => {
  let node;

  const targetElm = hasOnlyOneBlockChild(dom, toElm) ? toElm.firstChild as HTMLElement : toElm;
  unwrapSingleBlockChild(dom, fromElm);

  if (!NodeType.isEmpty(dom, fromElm, true)) {
    while ((node = fromElm.firstChild)) {
      targetElm.appendChild(node);
    }
  }
};

const mergeLiElements = (dom: DOMUtils, fromElm: Element, toElm: Element): void => {
  let listNode: HTMLElement | undefined;
  const ul = fromElm.parentNode as Node;

  if (!NodeType.isChildOfBody(dom, fromElm) || !NodeType.isChildOfBody(dom, toElm)) {
    return;
  }

  if (NodeType.isListNode(toElm.lastChild)) {
    listNode = toElm.lastChild;
  }

  if (ul === toElm.lastChild) {
    if (NodeType.isBr(ul.previousSibling)) {
      dom.remove(ul.previousSibling);
    }
  }

  const node = toElm.lastChild;
  if (node && NodeType.isBr(node) && fromElm.hasChildNodes()) {
    dom.remove(node);
  }

  if (NodeType.isEmpty(dom, toElm, true)) {
    Remove.empty(SugarElement.fromDom(toElm));
  }

  moveChildren(dom, fromElm, toElm);

  if (listNode) {
    toElm.appendChild(listNode);
  }

  const contains = Compare.contains(SugarElement.fromDom(toElm), SugarElement.fromDom(fromElm));

  const nestedLists = contains ? dom.getParents(fromElm, NodeType.isListNode, toElm) : [];

  dom.remove(fromElm);

  Arr.each(nestedLists, (list) => {
    if (NodeType.isEmpty(dom, list) && list !== dom.getRoot()) {
      dom.remove(list);
    }
  });
};

const mergeIntoEmptyLi = (editor: Editor, fromLi: HTMLLIElement, toLi: HTMLLIElement): void => {
  Remove.empty(SugarElement.fromDom(toLi));
  mergeLiElements(editor.dom, fromLi, toLi);
  editor.selection.setCursorLocation(toLi, 0);
};

const mergeForward = (editor: Editor, rng: Range, fromLi: HTMLLIElement, toLi: HTMLLIElement): void => {
  const dom = editor.dom;

  if (dom.isEmpty(toLi)) {
    mergeIntoEmptyLi(editor, fromLi, toLi);
  } else {
    const bookmark = Bookmark.createBookmark(rng);
    mergeLiElements(dom, fromLi, toLi);
    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
  }
};

const mergeBackward = (editor: Editor, rng: Range, fromLi: HTMLLIElement, toLi: HTMLLIElement): void => {
  const bookmark = Bookmark.createBookmark(rng);
  mergeLiElements(editor.dom, fromLi, toLi);
  const resolvedBookmark = Bookmark.resolveBookmark(bookmark);
  editor.selection.setRng(resolvedBookmark);
};

const backspaceDeleteFromListToListCaret = (editor: Editor, isForward: boolean): boolean => {
  const dom = editor.dom, selection = editor.selection;
  const selectionStartElm = selection.getStart();
  const root = Selection.getClosestEditingHost(editor, selectionStartElm);
  const li = dom.getParent(selection.getStart(), 'LI', root) as HTMLLIElement;

  if (li) {
    const ul = li.parentElement;
    if (ul === editor.getBody() && NodeType.isEmpty(dom, ul)) {
      return true;
    }

    const rng = ListRangeUtils.normalizeRange(selection.getRng());
    const otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root) as HTMLLIElement;
    const willMergeParentIntoChild = otherLi && (isForward ? dom.isChildOf(li, otherLi) : dom.isChildOf(otherLi, li));

    if (otherLi && otherLi !== li && !willMergeParentIntoChild) {
      editor.undoManager.transact(() => {
        if (isForward) {
          mergeForward(editor, rng, otherLi, li);
        } else {
          if (NodeType.isFirstChild(li)) {
            outdentListSelection(editor);
          } else {
            mergeBackward(editor, rng, li, otherLi);
          }
        }
      });

      return true;
    } else if (willMergeParentIntoChild && !isForward && otherLi !== li) {
      editor.undoManager.transact(() => {
        if (rng.commonAncestorContainer.parentElement) {
          const bookmark = Bookmark.createBookmark(rng);
          const oldParentElRef = rng.commonAncestorContainer.parentElement;
          moveChildren(dom, rng.commonAncestorContainer.parentElement, otherLi);
          oldParentElRef.remove();
          const resolvedBookmark = Bookmark.resolveBookmark(bookmark);
          editor.selection.setRng(resolvedBookmark);
        }
      });

      return true;
    } else if (!otherLi) {
      if (!isForward && rng.startOffset === 0 && rng.endOffset === 0) {
        editor.undoManager.transact(() => {
          flattenListSelection(editor);
        });

        return true;
      }
    }
  }

  return false;
};

const removeBlock = (dom: DOMUtils, block: Element, root: Node): void => {
  const parentBlock = dom.getParent(block.parentNode, dom.isBlock, root);

  dom.remove(block);
  if (parentBlock && dom.isEmpty(parentBlock)) {
    dom.remove(parentBlock);
  }
};

const backspaceDeleteIntoListCaret = (editor: Editor, isForward: boolean): boolean => {
  const dom = editor.dom;
  const selectionStartElm = editor.selection.getStart();
  const root = Selection.getClosestEditingHost(editor, selectionStartElm);
  const block = dom.getParent(selectionStartElm, dom.isBlock, root);

  if (block && dom.isEmpty(block)) {
    const rng = ListRangeUtils.normalizeRange(editor.selection.getRng());
    const otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root);

    if (otherLi) {
      const findValidElement = (element: SugarElement<Node>) => Arr.contains([ 'td', 'th', 'caption' ], SugarNode.name(element));
      const findRoot = (node: SugarElement<Node>) => node.dom === root;
      const otherLiCell = PredicateFind.closest(SugarElement.fromDom(otherLi), findValidElement, findRoot);
      const caretCell = PredicateFind.closest(SugarElement.fromDom(rng.startContainer), findValidElement, findRoot);

      if (!Optionals.equals(otherLiCell, caretCell, Compare.eq)) {
        return false;
      }

      editor.undoManager.transact(() => {
        const parentNode = otherLi.parentNode as HTMLElement;
        removeBlock(dom, block, root);
        ToggleList.mergeWithAdjacentLists(dom, parentNode);
        editor.selection.select(otherLi, true);
        editor.selection.collapse(isForward);
      });

      return true;
    }
  }

  return false;
};

const backspaceDeleteCaret = (editor: Editor, isForward: boolean): boolean => {
  return backspaceDeleteFromListToListCaret(editor, isForward) || backspaceDeleteIntoListCaret(editor, isForward);
};

const hasListSelection = (editor: Editor) => {
  const selectionStartElm = editor.selection.getStart();
  const root = Selection.getClosestEditingHost(editor, selectionStartElm);
  const startListParent = editor.dom.getParent(selectionStartElm, 'LI,DT,DD', root);

  return startListParent || Selection.getSelectedListItems(editor).length > 0;
};

const backspaceDeleteRange = (editor: Editor): boolean => {
  if (hasListSelection(editor)) {
    editor.undoManager.transact(() => {
      editor.execCommand('Delete');
      NormalizeLists.normalizeLists(editor.dom, editor.getBody());
    });

    return true;
  }

  return false;
};

const backspaceDelete = (editor: Editor, isForward: boolean): boolean => {
  const selection = editor.selection;
  return !isWithinNonEditableList(editor, selection.getNode()) && (selection.isCollapsed() ?
    backspaceDeleteCaret(editor, isForward) : backspaceDeleteRange(editor)
  );
};

const setup = (editor: Editor): void => {
  editor.on('ExecCommand', (e) => {
    const cmd = e.command.toLowerCase();
    if ((cmd === 'delete' || cmd === 'forwarddelete') && hasListSelection(editor)) {
      NormalizeLists.normalizeLists(editor.dom, editor.getBody());
    }
  });

  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE) {
      if (backspaceDelete(editor, false)) {
        e.preventDefault();
      }
    } else if (e.keyCode === VK.DELETE) {
      if (backspaceDelete(editor, true)) {
        e.preventDefault();
      }
    }
  });
};

export {
  setup,
  backspaceDelete
};
