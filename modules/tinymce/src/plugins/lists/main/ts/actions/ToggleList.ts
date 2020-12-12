/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import BookmarkManager from 'tinymce/core/api/dom/BookmarkManager';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import { fireListEvent } from '../api/Events';
import * as Bookmark from '../core/Bookmark';
import { listToggleActionFromListName } from '../core/ListAction';
import * as NodeType from '../core/NodeType';
import * as Selection from '../core/Selection';
import { isCustomList } from '../core/Util';
import { flattenListSelection } from './Indendation';

const updateListStyle = (dom, el, detail) => {
  const type = detail['list-style-type'] ? detail['list-style-type'] : null;
  dom.setStyle(el, 'list-style-type', type);
};

const setAttribs = (elm, attrs) => {
  Tools.each(attrs, (value, key) => {
    elm.setAttribute(key, value);
  });
};

const updateListAttrs = (dom, el, detail) => {
  setAttribs(el, detail['list-attributes']);
  Tools.each(dom.select('li', el), (li) => {
    setAttribs(li, detail['list-item-attributes']);
  });
};

const updateListWithDetails = (dom, el, detail) => {
  updateListStyle(dom, el, detail);
  updateListAttrs(dom, el, detail);
};

const removeStyles = (dom, element: HTMLElement, styles: string[]) => {
  Tools.each(styles, (style) => dom.setStyle(element, { [style]: '' }));
};

const getEndPointNode = (editor, rng, start, root) => {
  let container = rng[start ? 'startContainer' : 'endContainer'];
  const offset = rng[start ? 'startOffset' : 'endOffset'];

  // Resolve node index
  if (container.nodeType === 1) {
    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
  }

  if (!start && NodeType.isBr(container.nextSibling)) {
    container = container.nextSibling;
  }

  while (container.parentNode !== root) {
    if (NodeType.isTextBlock(editor, container)) {
      return container;
    }

    if (/^(TD|TH)$/.test(container.parentNode.nodeName)) {
      return container;
    }

    container = container.parentNode;
  }

  return container;
};

const getSelectedTextBlocks = (editor: Editor, rng, root) => {
  const textBlocks = [], dom = editor.dom;

  const startNode = getEndPointNode(editor, rng, true, root);
  const endNode = getEndPointNode(editor, rng, false, root);
  let block;
  const siblings = [];

  for (let node = startNode; node; node = node.nextSibling) {
    siblings.push(node);

    if (node === endNode) {
      break;
    }
  }

  Tools.each(siblings, (node) => {
    if (NodeType.isTextBlock(editor, node)) {
      textBlocks.push(node);
      block = null;
      return;
    }

    if (dom.isBlock(node) || NodeType.isBr(node)) {
      if (NodeType.isBr(node)) {
        dom.remove(node);
      }

      block = null;
      return;
    }

    const nextSibling = node.nextSibling;
    if (BookmarkManager.isBookmarkNode(node)) {
      if (NodeType.isListNode(nextSibling) || NodeType.isTextBlock(editor, nextSibling) || (!nextSibling && node.parentNode === root)) {
        block = null;
        return;
      }
    }

    if (!block) {
      block = dom.create('p');
      node.parentNode.insertBefore(block, node);
      textBlocks.push(block);
    }

    block.appendChild(node);
  });

  return textBlocks;
};

const hasCompatibleStyle = (dom: DOMUtils, sib, detail) => {
  const sibStyle = dom.getStyle(sib, 'list-style-type');
  let detailStyle = detail ? detail['list-style-type'] : '';

  detailStyle = detailStyle === null ? '' : detailStyle;

  return sibStyle === detailStyle;
};

const applyList = (editor: Editor, listName: string, detail = {}) => {
  const rng = editor.selection.getRng();
  let listItemName = 'LI';
  const root = Selection.getClosestListRootElm(editor, editor.selection.getStart(true));
  const dom = editor.dom;

  if (dom.getContentEditable(editor.selection.getNode()) === 'false') {
    return;
  }

  listName = listName.toUpperCase();

  if (listName === 'DL') {
    listItemName = 'DT';
  }

  const bookmark = Bookmark.createBookmark(rng);
  const selectedTextBlocks = getSelectedTextBlocks(editor, rng, root);

  Tools.each(selectedTextBlocks, (block) => {
    let listBlock;

    const sibling = block.previousSibling;
    const parent = block.parentNode;

    if (!NodeType.isListItemNode(parent)) {
      if (sibling && NodeType.isListNode(sibling) && sibling.nodeName === listName && hasCompatibleStyle(dom, sibling, detail)) {
        listBlock = sibling;
        block = dom.rename(block, listItemName);
        sibling.appendChild(block);
      } else {
        listBlock = dom.create(listName);
        block.parentNode.insertBefore(listBlock, block);
        listBlock.appendChild(block);
        block = dom.rename(block, listItemName);
      }

      removeStyles(dom, block, [
        'margin', 'margin-right', 'margin-bottom', 'margin-left', 'margin-top',
        'padding', 'padding-right', 'padding-bottom', 'padding-left', 'padding-top'
      ]);

      updateListWithDetails(dom, listBlock, detail);
      mergeWithAdjacentLists(editor.dom, listBlock);
    }
  });

  editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
};

const isValidLists = (list1, list2) => {
  return list1 && list2 && NodeType.isListNode(list1) && list1.nodeName === list2.nodeName;
};

const hasSameListStyle = (dom, list1, list2) => {
  const targetStyle = dom.getStyle(list1, 'list-style-type', true);
  const style = dom.getStyle(list2, 'list-style-type', true);
  return targetStyle === style;
};

const hasSameClasses = (elm1, elm2) => {
  return elm1.className === elm2.className;
};

const shouldMerge = (dom, list1, list2) => {
  return isValidLists(list1, list2) && hasSameListStyle(dom, list1, list2) && hasSameClasses(list1, list2);
};

const mergeWithAdjacentLists = (dom, listBlock) => {
  let sibling, node;

  sibling = listBlock.nextSibling;
  if (shouldMerge(dom, listBlock, sibling)) {
    while ((node = sibling.firstChild)) {
      listBlock.appendChild(node);
    }

    dom.remove(sibling);
  }

  sibling = listBlock.previousSibling;
  if (shouldMerge(dom, listBlock, sibling)) {
    while ((node = sibling.lastChild)) {
      listBlock.insertBefore(node, listBlock.firstChild);
    }

    dom.remove(sibling);
  }
};

const updateList = (editor: Editor, list, listName, detail) => {
  if (list.nodeName !== listName) {
    const newList = editor.dom.rename(list, listName);
    updateListWithDetails(editor.dom, newList, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), newList);
  } else {
    updateListWithDetails(editor.dom, list, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), list);
  }
};

const toggleMultipleLists = (editor, parentList, lists, listName, detail) => {
  const parentIsList = NodeType.isListNode(parentList);
  if (parentIsList && parentList.nodeName === listName && !hasListStyleDetail(detail)) {
    flattenListSelection(editor);
  } else {
    applyList(editor, listName, detail);
    const bookmark = Bookmark.createBookmark(editor.selection.getRng(true));
    const allLists = parentIsList ? [ parentList, ...lists ] : lists;

    Tools.each(allLists, (elm) => {
      updateList(editor, elm, listName, detail);
    });

    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
  }
};

const hasListStyleDetail = (detail) => {
  return 'list-style-type' in detail;
};

const toggleSingleList = (editor, parentList, listName, detail) => {
  if (parentList === editor.getBody()) {
    return;
  }

  if (parentList) {
    if (parentList.nodeName === listName && !hasListStyleDetail(detail) && !isCustomList(parentList)) {
      flattenListSelection(editor);
    } else {
      const bookmark = Bookmark.createBookmark(editor.selection.getRng(true));
      updateListWithDetails(editor.dom, parentList, detail);
      const newList = editor.dom.rename(parentList, listName);
      mergeWithAdjacentLists(editor.dom, newList);
      editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
      applyList(editor, listName, detail);
      fireListEvent(editor, listToggleActionFromListName(listName), newList);
    }
  } else {
    applyList(editor, listName, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), parentList);
  }
};

const toggleList = (editor, listName, detail) => {
  const parentList = Selection.getParentList(editor);
  const selectedSubLists = Selection.getSelectedSubLists(editor);

  detail = detail ? detail : {};

  if (selectedSubLists.length > 0) {
    toggleMultipleLists(editor, parentList, selectedSubLists, listName, detail);
  } else {
    toggleSingleList(editor, parentList, listName, detail);
  }
};

export {
  toggleList,
  mergeWithAdjacentLists
};
