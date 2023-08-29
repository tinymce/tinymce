import { Arr, Optional, Type, Unicode } from '@ephox/katamari';
import { Has, SugarElement } from '@ephox/sugar';

import BookmarkManager from 'tinymce/core/api/dom/BookmarkManager';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';

import { fireListEvent } from '../api/Events';
import * as Bookmark from '../core/Bookmark';
import { listToggleActionFromListName } from '../core/ListAction';
import * as NodeType from '../core/NodeType';
import * as Selection from '../core/Selection';
import { isCustomList, isWithinNonEditableList } from '../core/Util';
import { flattenListSelection } from './Indendation';

interface ListDetail {
  readonly 'list-style-type'?: string;
  readonly 'list-attributes'?: Record<string, string>;
  readonly 'list-item-attributes'?: Record<string, string>;
}

const updateListStyle = (dom: DOMUtils, el: Element, detail: ListDetail): void => {
  const type = detail['list-style-type'] ? detail['list-style-type'] : null;
  dom.setStyle(el, 'list-style-type', type);
};

const setAttribs = (elm: Element, attrs: Record<string, string> | undefined): void => {
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
  Tools.each(styles, (style) => dom.setStyle(element, style, ''));
};

const isInline = (editor: Editor, node: Node): boolean => Type.isNonNullable(node) && !NodeType.isBlock(node, editor.schema.getBlockElements());

const getEndPointNode = (editor: Editor, rng: Range, start: Boolean, root: Node): Node => {
  let container = rng[start ? 'startContainer' : 'endContainer'];
  const offset = rng[start ? 'startOffset' : 'endOffset'];

  // Resolve node index
  if (NodeType.isElement(container)) {
    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
  }

  if (!start && NodeType.isBr(container.nextSibling)) {
    container = container.nextSibling;
  }

  const findBlockAncestor = (node: Node) => {
    while (!editor.dom.isBlock(node) && node.parentNode && root !== node) {
      node = node.parentNode;
    }

    return node;
  };

  // The reason why the next two if statements exist is because when the root node is a table cell (possibly some other node types)
  // then the highest we can go up the dom hierarchy is one level below the table cell.
  // So what happens when we have a bunch of inline nodes and text nodes in the table cell
  // and when the selection is collapsed inside one of the inline nodes then only that inline node (or text node) will be included
  // in the created list because that would be one level below td node and the other inline nodes won't be included.
  // So the fix proposed is to traverse left when looking for start node (and traverse right when looking for end node)
  // and keep traversing as long as we have an inline or text node (same for traversing right).
  // This way we end up including all the inline elements in the created list.
  // For more info look at #TINY-6853

  const findBetterContainer = (container: Node, forward: boolean): Optional<Node> => {
    const walker = new DomTreeWalker(container, findBlockAncestor(container));
    const dir = forward ? 'next' : 'prev';
    let node;
    while ((node = walker[dir]())) {
      if (!(NodeType.isVoid(editor, node) || Unicode.isZwsp(node.textContent as string) || node.textContent?.length === 0)) {
        return Optional.some(node);
      }
    }

    return Optional.none();
  };

  // Traverse left to include inline/text nodes
  if (start && NodeType.isTextNode(container)) {
    if (Unicode.isZwsp(container.textContent as string)) {
      container = findBetterContainer(container, false).getOr(container);
    } else {
      if (container.parentNode !== null && isInline(editor, container.parentNode)) {
        container = container.parentNode;
      }
      while (container.previousSibling !== null && (isInline(editor, container.previousSibling) || NodeType.isTextNode(container.previousSibling))) {
        container = container.previousSibling;
      }
    }
  }

  // Traverse right to include inline/text nodes
  if (!start && NodeType.isTextNode(container)) {
    if (Unicode.isZwsp(container.textContent as string)) {
      container = findBetterContainer(container, true).getOr(container);
    } else {
      if (container.parentNode !== null && isInline(editor, container.parentNode)) {
        container = container.parentNode;
      }
      while (container.nextSibling !== null && (isInline(editor, container.nextSibling) || NodeType.isTextNode(container.nextSibling))) {
        container = container.nextSibling;
      }
    }
  }

  while (container.parentNode !== root) {
    const parent = container.parentNode as Node;
    if (NodeType.isTextBlock(editor, container)) {
      return container;
    }

    if (/^(TD|TH)$/.test(parent.nodeName)) {
      return container;
    }

    container = parent;
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

  for (let node: Node | null = startNode; node; node = node.nextSibling) {
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
      node.parentNode?.insertBefore(block, node);
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

/*
  Find the first element we would transform into a li-element if given no constraints.
  If the common ancestor is higher up than that provide it as the starting-point for the search for the root instead of the first selected element.
  This helps avoid issues with divs that should become li-elements are detected as the root when they should not be.
*/
const getRootSearchStart = (editor: Editor, range: Range): Node => {
  const start = editor.selection.getStart(true);
  const startPoint = getEndPointNode(editor, range, true, editor.getBody());

  if (Has.ancestor(SugarElement.fromDom(startPoint), SugarElement.fromDom(range.commonAncestorContainer))) {
    return range.commonAncestorContainer;
  } else {
    return start;
  }
};

const applyList = (editor: Editor, listName: string, detail: ListDetail): void => {
  const rng = editor.selection.getRng();
  let listItemName = 'LI';
  const root = Selection.getClosestListHost(editor, getRootSearchStart(editor, rng));
  const dom = editor.dom;

  if (dom.getContentEditable(editor.selection.getNode()) === 'false') {
    return;
  }

  listName = listName.toUpperCase();

  if (listName === 'DL') {
    listItemName = 'DT';
  }

  const bookmark = Bookmark.createBookmark(rng);

  const selectedTextBlocks = Arr.filter(getSelectedTextBlocks(editor, rng, root), editor.dom.isEditable);

  Tools.each(selectedTextBlocks, (block) => {
    let listBlock: HTMLElement;

    const sibling = block.previousSibling;
    const parent = block.parentNode as Node;

    if (!NodeType.isListItemNode(parent)) {
      if (sibling && NodeType.isListNode(sibling) && sibling.nodeName === listName && hasCompatibleStyle(dom, sibling, detail)) {
        listBlock = sibling;
        block = dom.rename(block, listItemName) as HTMLElement;
        sibling.appendChild(block);
      } else {
        listBlock = dom.create(listName);
        parent.insertBefore(listBlock, block);
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

const isValidLists = (list1: Node | null, list2: Node | null): boolean => {
  return NodeType.isListNode(list1) && list1.nodeName === list2?.nodeName;
};

const hasSameListStyle = (dom: DOMUtils, list1: Element, list2: Element): boolean => {
  const targetStyle = dom.getStyle(list1, 'list-style-type', true);
  const style = dom.getStyle(list2, 'list-style-type', true);
  return targetStyle === style;
};

const hasSameClasses = (elm1: Element, elm2: Element): boolean => {
  return elm1.className === elm2.className;
};

const shouldMerge = (dom: DOMUtils, list1: Node | null, list2: Node | null): boolean => {
  return isValidLists(list1, list2) &&
    // Note: isValidLists will ensure list1 and list2 are a HTMLElement. Unfortunately TypeScript doesn't
    // support type guards on multiple variables. See https://github.com/microsoft/TypeScript/issues/26916
    hasSameListStyle(dom, list1 as HTMLElement, list2 as HTMLElement) &&
    hasSameClasses(list1 as HTMLElement, list2 as HTMLElement);
};

const mergeWithAdjacentLists = (dom: DOMUtils, listBlock: HTMLElement): void => {
  let node: Node | null;

  let sibling = listBlock.nextSibling;
  if (shouldMerge(dom, listBlock, sibling)) {
    const liSibling = sibling as HTMLElement;
    while ((node = liSibling.firstChild)) {
      listBlock.appendChild(node);
    }

    dom.remove(liSibling);
  }

  sibling = listBlock.previousSibling;
  if (shouldMerge(dom, listBlock, sibling)) {
    const liSibling = sibling as HTMLElement;
    while ((node = liSibling.lastChild)) {
      listBlock.insertBefore(node, listBlock.firstChild);
    }

    dom.remove(liSibling);
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

const updateCustomList = (editor: Editor, list: Element, listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  list.classList.forEach((cls, _, classList) => {
    if (cls.startsWith('tox-')) {
      classList.remove(cls);
      if (classList.length === 0) {
        list.removeAttribute('class');
      }
    }
  });
  if (list.nodeName !== listName) {
    const newList = editor.dom.rename(list, listName);
    updateListWithDetails(editor.dom, newList, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), newList);
  } else {
    updateListWithDetails(editor.dom, list, detail);
    fireListEvent(editor, listToggleActionFromListName(listName), list);
  }
};

const toggleMultipleLists = (editor: Editor, parentList: HTMLElement | null, lists: HTMLElement[], listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  const parentIsList = NodeType.isListNode(parentList);
  if (parentIsList && parentList.nodeName === listName && !hasListStyleDetail(detail) && !isCustomList(parentList)) {
    flattenListSelection(editor);
  } else {
    applyList(editor, listName, detail);
    const bookmark = Bookmark.createBookmark(editor.selection.getRng());
    const allLists = parentIsList ? [ parentList, ...lists ] : lists;

    const updateFunction = (parentIsList && isCustomList(parentList)) ? updateCustomList : updateList;

    Tools.each(allLists, (elm) => {
      updateFunction(editor, elm, listName, detail);
    });

    editor.selection.setRng(Bookmark.resolveBookmark(bookmark));
  }
};

const hasListStyleDetail = (detail: ListDetail): boolean => {
  return 'list-style-type' in detail;
};

const toggleSingleList = (editor: Editor, parentList: HTMLElement | null, listName: 'UL' | 'OL' | 'DL', detail: ListDetail): void => {
  if (parentList === editor.getBody()) {
    return;
  }

  if (parentList) {
    if (parentList.nodeName === listName && !hasListStyleDetail(detail) && !isCustomList(parentList)) {
      flattenListSelection(editor);
    } else {
      const bookmark = Bookmark.createBookmark(editor.selection.getRng());
      if (isCustomList(parentList)) {
        parentList.classList.forEach((cls, _, classList) => {
          if (cls.startsWith('tox-')) {
            classList.remove(cls);
            if (classList.length === 0) {
              parentList.removeAttribute('class');
            }
          }
        });
      }
      updateListWithDetails(editor.dom, parentList, detail);
      const newList = editor.dom.rename(parentList, listName) as HTMLElement;
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
  if (isWithinNonEditableList(editor, parentList)) {
    return;
  }

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
