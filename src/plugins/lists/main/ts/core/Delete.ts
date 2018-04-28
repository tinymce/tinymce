/**
 * Delete.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import VK from 'tinymce/core/api/util/VK';
import ToggleList from '../actions/ToggleList';
import Bookmark from './Bookmark';
import NodeType from './NodeType';
import NormalizeLists from './NormalizeLists';
import Range from './Range';
import Selection from './Selection';

const findNextCaretContainer = function (editor, rng, isForward, root) {
  let node = rng.startContainer;
  const offset = rng.startOffset;
  let nonEmptyBlocks, walker;

  if (node.nodeType === 3 && (isForward ? offset < node.data.length : offset > 0)) {
    return node;
  }

  nonEmptyBlocks = editor.schema.getNonEmptyElements();
  if (node.nodeType === 1) {
    node = RangeUtils.getNode(node, offset);
  }

  walker = new TreeWalker(node, root);

  // Delete at <li>|<br></li> then jump over the bogus br
  if (isForward) {
    if (NodeType.isBogusBr(editor.dom, node)) {
      walker.next();
    }
  }

  while ((node = walker[isForward ? 'next' : 'prev2']())) {
    if (node.nodeName === 'LI' && !node.hasChildNodes()) {
      return node;
    }

    if (nonEmptyBlocks[node.nodeName]) {
      return node;
    }

    if (node.nodeType === 3 && node.data.length > 0) {
      return node;
    }
  }
};

const hasOnlyOneBlockChild = function (dom, elm) {
  const childNodes = elm.childNodes;
  return childNodes.length === 1 && !NodeType.isListNode(childNodes[0]) && dom.isBlock(childNodes[0]);
};

const unwrapSingleBlockChild = function (dom, elm) {
  if (hasOnlyOneBlockChild(dom, elm)) {
    dom.remove(elm.firstChild, true);
  }
};

const moveChildren = function (dom, fromElm, toElm) {
  let node, targetElm;

  targetElm = hasOnlyOneBlockChild(dom, toElm) ? toElm.firstChild : toElm;
  unwrapSingleBlockChild(dom, fromElm);

  if (!NodeType.isEmpty(dom, fromElm, true)) {
    while ((node = fromElm.firstChild)) {
      targetElm.appendChild(node);
    }
  }
};

const mergeLiElements = function (dom, fromElm, toElm) {
  let node, listNode;
  const ul = fromElm.parentNode;

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

  node = toElm.lastChild;
  if (node && NodeType.isBr(node) && fromElm.hasChildNodes()) {
    dom.remove(node);
  }

  if (NodeType.isEmpty(dom, toElm, true)) {
    dom.$(toElm).empty();
  }

  moveChildren(dom, fromElm, toElm);

  if (listNode) {
    toElm.appendChild(listNode);
  }

  dom.remove(fromElm);

  if (NodeType.isEmpty(dom, ul) && ul !== dom.getRoot()) {
    dom.remove(ul);
  }
};

const mergeIntoEmptyLi = function (editor, fromLi, toLi) {
  editor.dom.$(toLi).empty();
  mergeLiElements(editor.dom, fromLi, toLi);
  editor.selection.setCursorLocation(toLi);
};

const mergeForward = function (editor, rng, fromLi, toLi) {
  const dom = editor.dom;

  if (dom.isEmpty(toLi)) {
    mergeIntoEmptyLi(editor, fromLi, toLi);
  } else {
    const bookmark = Bookmark.createBookmark(rng);
    mergeLiElements(dom, fromLi, toLi);
    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
  }
};

const mergeBackward = function (editor, rng, fromLi, toLi) {
  const bookmark = Bookmark.createBookmark(rng);
  mergeLiElements(editor.dom, fromLi, toLi);
  const resolvedBookmark = Bookmark.resolveBookmark(bookmark);
  editor.selection.setRng(resolvedBookmark);
};

const backspaceDeleteFromListToListCaret = function (editor, isForward) {
  const dom = editor.dom, selection = editor.selection;
  const selectionStartElm = selection.getStart();
  const root = Selection.getClosestListRootElm(editor, selectionStartElm);
  const li = dom.getParent(selection.getStart(), 'LI', root);
  let ul, rng, otherLi;

  if (li) {
    ul = li.parentNode;
    if (ul === editor.getBody() && NodeType.isEmpty(dom, ul)) {
      return true;
    }

    rng = Range.normalizeRange(selection.getRng(true));
    otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root);

    if (otherLi && otherLi !== li) {
      if (isForward) {
        mergeForward(editor, rng, otherLi, li);
      } else {
        mergeBackward(editor, rng, li, otherLi);
      }

      return true;
    } else if (!otherLi) {
      if (!isForward && ToggleList.removeList(editor)) {
        return true;
      }
    }
  }

  return false;
};

const removeBlock = function (dom, block, root) {
  const parentBlock = dom.getParent(block.parentNode, dom.isBlock, root);

  dom.remove(block);
  if (parentBlock && dom.isEmpty(parentBlock)) {
    dom.remove(parentBlock);
  }
};

const backspaceDeleteIntoListCaret = function (editor, isForward) {
  const dom = editor.dom;
  const selectionStartElm = editor.selection.getStart();
  const root = Selection.getClosestListRootElm(editor, selectionStartElm);
  const block = dom.getParent(selectionStartElm, dom.isBlock, root);

  if (block && dom.isEmpty(block)) {
    const rng = Range.normalizeRange(editor.selection.getRng(true));
    const otherLi = dom.getParent(findNextCaretContainer(editor, rng, isForward, root), 'LI', root);

    if (otherLi) {
      editor.undoManager.transact(function () {
        removeBlock(dom, block, root);
        ToggleList.mergeWithAdjacentLists(dom, otherLi.parentNode);
        editor.selection.select(otherLi, true);
        editor.selection.collapse(isForward);
      });

      return true;
    }
  }

  return false;
};

const backspaceDeleteCaret = function (editor, isForward) {
  return backspaceDeleteFromListToListCaret(editor, isForward) || backspaceDeleteIntoListCaret(editor, isForward);
};

const backspaceDeleteRange = function (editor) {
  const selectionStartElm = editor.selection.getStart();
  const root = Selection.getClosestListRootElm(editor, selectionStartElm);
  const startListParent = editor.dom.getParent(selectionStartElm, 'LI,DT,DD', root);

  if (startListParent || Selection.getSelectedListItems(editor).length > 0) {
    editor.undoManager.transact(function () {
      editor.execCommand('Delete');
      NormalizeLists.normalizeLists(editor.dom, editor.getBody());
    });

    return true;
  }

  return false;
};

const backspaceDelete = function (editor, isForward) {
  return editor.selection.isCollapsed() ? backspaceDeleteCaret(editor, isForward) : backspaceDeleteRange(editor);
};

const setup = function (editor) {
  editor.on('keydown', function (e) {
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

export default {
  setup,
  backspaceDelete
};