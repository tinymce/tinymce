import { Arr, Optional, Type } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Schema from 'tinymce/core/api/html/Schema';
import Tools from 'tinymce/core/api/util/Tools';

import * as NodeType from './NodeType';

const listNames = [ 'OL', 'UL', 'DL' ];
const listSelector = listNames.join(',');

const getParentList = (editor: Editor, node?: Node): HTMLElement | null => {
  const selectionStart = node || editor.selection.getStart(true);

  return editor.dom.getParent(selectionStart, listSelector, getClosestListHost(editor, selectionStart));
};

const isParentListSelected = (parentList: HTMLElement | null, selectedBlocks: Element[]): boolean =>
  Type.isNonNullable(parentList) && selectedBlocks.length === 1 && selectedBlocks[0] === parentList;

const findSubLists = (parentList: HTMLElement): HTMLElement[] =>
  Arr.filter(parentList.querySelectorAll(listSelector), NodeType.isListNode);

const getSelectedSubLists = (editor: Editor): HTMLElement[] => {
  const parentList = getParentList(editor);
  const selectedBlocks = editor.selection.getSelectedBlocks();

  if (isParentListSelected(parentList, selectedBlocks)) {
    return findSubLists(parentList as HTMLElement);
  } else {
    return Arr.filter(selectedBlocks, (elm): elm is HTMLElement => {
      return NodeType.isListNode(elm) && parentList !== elm;
    });
  }
};

const findParentListItemsNodes = (editor: Editor, elms: Element[]): Element[] => {
  const listItemsElms = Tools.map(elms, (elm) => {
    const parentLi = editor.dom.getParent(elm, 'li,dd,dt', getClosestListHost(editor, elm));

    return parentLi ? parentLi : elm;
  });

  return Arr.unique(listItemsElms);
};

const getSelectedListItems = (editor: Editor): Array<HTMLLIElement | HTMLElement> => {
  const selectedBlocks = editor.selection.getSelectedBlocks();
  return Arr.filter(findParentListItemsNodes(editor, selectedBlocks), NodeType.isListItemNode);
};

const getSelectedDlItems = (editor: Editor): HTMLElement[] =>
  Arr.filter(getSelectedListItems(editor), NodeType.isDlItemNode);

const getClosestEditingHost = (editor: Editor, elm: Element): HTMLElement => {
  const parentTableCell = editor.dom.getParents<HTMLTableCellElement>(elm, 'TD,TH');
  return parentTableCell.length > 0 ? parentTableCell[0] : editor.getBody();
};

const isListHost = (schema: Schema, node: Node): boolean =>
  !NodeType.isListNode(node) && !NodeType.isListItemNode(node) && Arr.exists(listNames, (listName) => schema.isValidChild(node.nodeName, listName));

const getClosestListHost = (editor: Editor, elm: Node): HTMLElement => {
  const parentBlocks = editor.dom.getParents<HTMLElement>(elm, editor.dom.isBlock);
  const parentBlock = Arr.find(parentBlocks, (elm) => isListHost(editor.schema, elm));

  return parentBlock.getOr(editor.getBody());
};

const isListInsideAnLiWithFirstAndLastNotListElement = (list: SugarElement<Node>): boolean =>
  Traverse.parent(list).exists((parent) => NodeType.isListItemNode(parent.dom)
    && Traverse.firstChild(parent).exists((firstChild) => !NodeType.isListNode(firstChild.dom))
    && Traverse.lastChild(parent).exists((lastChild) => !NodeType.isListNode(lastChild.dom))
  );

const findLastParentListNode = (editor: Editor, elm: Element): Optional<HTMLOListElement | HTMLUListElement> => {
  const parentLists = editor.dom.getParents<HTMLOListElement | HTMLUListElement>(elm, 'ol,ul', getClosestListHost(editor, elm));
  return Arr.last(parentLists);
};

const getSelectedLists = (editor: Editor): Array<HTMLOListElement | HTMLUListElement> => {
  const firstList = findLastParentListNode(editor, editor.selection.getStart());
  const subsequentLists = Arr.filter(editor.selection.getSelectedBlocks(), NodeType.isOlUlNode);

  return firstList.toArray().concat(subsequentLists);
};

const getParentLists = (editor: Editor) => {
  const elm = editor.selection.getStart();
  return editor.dom.getParents<HTMLOListElement | HTMLUListElement>(elm, 'ol,ul', getClosestListHost(editor, elm));
};

const getSelectedListRoots = (editor: Editor): HTMLElement[] => {
  const selectedLists = getSelectedLists(editor);
  const parentLists = getParentLists(editor);
  return Arr.find(parentLists, (p) => isListInsideAnLiWithFirstAndLastNotListElement(SugarElement.fromDom(p))).fold(
    () => getUniqueListRoots(editor, selectedLists),
    (l) => [ l ]
  );
};

const getUniqueListRoots = (editor: Editor, lists: HTMLElement[]): HTMLElement[] => {
  const listRoots = Arr.map(lists, (list) => findLastParentListNode(editor, list).getOr(list));
  return Arr.unique(listRoots);
};

export {
  isListHost,
  getParentList,
  getSelectedSubLists,
  getSelectedListItems,
  getClosestEditingHost,
  getClosestListHost,
  getSelectedDlItems,
  getSelectedListRoots
};
