/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

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

interface ListDetail {
  readonly 'list-style-type'?: string;
  readonly 'list-attributes'?: Record<string, string>;
  readonly 'list-item-attributes'?: Record<string, string>;
}

const updateListStyle = (dom: DOMUtils, el: Node, detail: ListDetail): void => {
  const type = detail['list-style-type'] ? detail['list-style-type'] : null;
  dom.setStyle(el, 'list-style-type', type);
};

const setAttribs = (elm: Element, attrs: Record<string, string>): void => {
  Tools.each(attrs, (value, key) => {
    elm.setAttribute(key, value);
  });
};

const updateListAttrs = (dom: DOMUtils, el: Element, detail: ListDetail): void => {
  setAttribs(el, detail['list-attributes']);
  Tools.each(dom.select('li', el), (li) => {
    setAttribs(li, detail['list-item-attributes']);
  });
};

const updateListWithDetails = (dom: DOMUtils, el: Element, detail: ListDetail): void => {
  updateListStyle(dom, el, detail);
  updateListAttrs(dom, el, detail);
};

const removeStyles = (dom: DOMUtils, element: HTMLElement, styles: string[]): void => {
  Tools.each(styles, (style) => dom.setStyle(element, { [style]: '' }));
};

const getEndPointNode = (editor: Editor, rng: Range, start: Boolean, root: Node): Node => {
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

const getSelectedTextBlocks = (editor: Editor, rng: Range, root: Node): HTMLElement[] => {
  const textBlocks: HTMLElement[] = [];
  const dom = editor.dom;

  const startNode = getEndPointNode(editor, rng, true, root);
  const endNode = getEndPointNode(editor, rng, false, root);
  let block: HTMLElement | null;
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

const hasCompatibleStyle = (dom: DOMUtils, sib: Element, detail: ListDetail): boolean => {
  const sibStyle = dom.getStyle(sib, 'list-style-type');
  let detailStyle = detail ? detail['list-style-type'] : '';

  detailStyle = detailStyle === null ? '' : detailStyle;

  return sibStyle === detailStyle;
};

const applyList = (editor: Editor, listName: string, detail: ListDetail): void => {
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
        block = dom.rename(block, listItemName) as HTMLElement;
        sibling.appendChild(block);
      } else {
        listBlock = dom.create(listName);
        block.parentNode.insertBefore(listBlock, block);
        listBlock.appendChild(block);
        block = dom.rename(block, listItemName) as HTMLElement;
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

const isValidLists = (list1: Node | undefined, list2: Node | undefined): boolean => {
  return list1 && list2 && NodeType.isListNode(list1) && list1.nodeName === list2.nodeName;
};

const hasSameListStyle = (dom: DOMUtils, list1: Node, list2: Node): boolean => {
  const targetStyle = dom.getStyle(list1, 'list-style-type', true);
  const style = dom.getStyle(list2, 'list-style-type', true);
  return targetStyle === style;
};

const hasSameClasses = (elm1: Element, elm2: Element): boolean => {
  return elm1.className === elm2.className;
};

const shouldMerge = (dom: DOMUtils, list1: Node | undefined, list2: Node | undefined): boolean => {
  return isValidLists(list1, list2) &&
    // Note: isValidLists will ensure list1 and list2 are a HTMLElement. Unfortunately TypeScript doesn't
    // support type guards on multiple variables. See https://github.com/microsoft/TypeScript/issues/26916
    hasSameListStyle(dom, list1, list2) &&
    hasSameClasses(list1 as HTMLElement, list2 as HTMLElement);
};

const mergeWithAdjacentLists = (dom: DOMUtils, listBlock: Element): void => {
  let sibling: Node | undefined, node: Node | undefined;

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

const updateList = (editor: Editor, list: Element, listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  if (list.nodeName !== listName) {
    const newList = editor.dom.rename(list, listName);
    updateListWithDetails(editor.dom, newList, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), newList);
  } else {
    updateListWithDetails(editor.dom, list, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), list);
  }
};

const toggleMultipleLists = (editor: Editor, parentList: HTMLElement, lists: HTMLElement[], listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  const parentIsList = NodeType.isListNode(parentList);
  if (parentIsList && parentList.nodeName === listName && !hasListStyleDetail(detail)) {
    flattenListSelection(editor);
  } else {
    applyList(editor, listName, detail);
    const bookmark = Bookmark.createBookmark(editor.selection.getRng());
    const allLists = parentIsList ? [ parentList, ...lists ] : lists;

    Tools.each(allLists, (elm) => {
      updateList(editor, elm, listName, detail);
    });

    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
  }
};

const hasListStyleDetail = (detail: ListDetail): boolean => {
  return 'list-style-type' in detail;
};

const toggleSingleList = (editor: Editor, parentList: HTMLElement, listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  if (parentList === editor.getBody()) {
    return;
  }

  if (parentList) {
    if (parentList.nodeName === listName && !hasListStyleDetail(detail) && !isCustomList(parentList)) {
      flattenListSelection(editor);
    } else {
      const bookmark = Bookmark.createBookmark(editor.selection.getRng());
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

const toggleList = (editor: Editor, listName: 'UL' | 'OL' | 'DL', _detail: ListDetail | null): void => {
  const parentList = Selection.getParentList(editor);
  const selectedSubLists = Selection.getSelectedSubLists(editor);

  const detail = Type.isObject(_detail) ? _detail : {};

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
