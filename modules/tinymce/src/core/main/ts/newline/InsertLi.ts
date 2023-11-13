import { Arr, Fun, Obj, Type } from '@ephox/katamari';
import { Css, Insert, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from '../api/Editor';
import * as NodeType from '../dom/NodeType';
import * as NewLineUtils from './NewLineUtils';

const hasFirstChild = (elm: Node, name: string) => {
  return elm.firstChild && elm.firstChild.nodeName === name;
};

const isFirstChild = (elm: Node) => {
  return elm.parentNode?.firstChild === elm;
};

const hasParent = (elm: Node | null, parentName: string): boolean => {
  const parentNode = elm?.parentNode;
  return Type.isNonNullable(parentNode) && parentNode.nodeName === parentName;
};

const isListBlock = (elm: Node | null): elm is HTMLElement => {
  return Type.isNonNullable(elm) && /^(OL|UL|LI)$/.test(elm.nodeName);
};

const isListItem = (elm: Node | null): elm is HTMLElement => {
  return Type.isNonNullable(elm) && /^(LI|DT|DD)$/.test(elm.nodeName);
};

const isNestedList = (elm: Element) => {
  return isListBlock(elm) && isListBlock(elm.parentNode);
};

const getContainerBlock = (containerBlock: Element): Element => {
  const containerBlockParent = containerBlock.parentNode;
  return isListItem(containerBlockParent) ? containerBlockParent : containerBlock;
};

const isFirstOrLastLi = (containerBlock: Element, parentBlock: Element, first: boolean) => {
  let node = containerBlock[first ? 'firstChild' : 'lastChild'];

  // Find first/last element since there might be whitespace there
  while (node) {
    if (NodeType.isElement(node)) {
      break;
    }

    node = node[first ? 'nextSibling' : 'previousSibling'];
  }

  return node === parentBlock;
};

const getStyles = (elm: HTMLElement): string => Arr.foldl(
  Obj.mapToArray(Css.getAllRaw(SugarElement.fromDom(elm)), (style, styleName) => `${styleName}: ${style};`),
  (acc, s) => acc + s,
  '');

// Inserts a block or br before/after or in the middle of a split list of the LI is empty
const insert = (editor: Editor, createNewBlock: (name: string, styles?: Record<string, string>) => Element, containerBlock: Element, parentBlock: Element, newBlockName: string): void => {
  const dom = editor.dom;
  const rng = editor.selection.getRng();
  const containerParent = containerBlock.parentNode;

  if (containerBlock === editor.getBody() || !containerParent) {
    return;
  }

  if (isNestedList(containerBlock)) {
    newBlockName = 'LI';
  }

  const parentBlockStyles = isListItem(parentBlock) ? getStyles(parentBlock) : undefined;
  let newBlock = isListItem(parentBlock) && parentBlockStyles
    ? createNewBlock(newBlockName, { style: getStyles(parentBlock) })
    : createNewBlock(newBlockName);

  if (isFirstOrLastLi(containerBlock, parentBlock, true) && isFirstOrLastLi(containerBlock, parentBlock, false)) {
    if (hasParent(containerBlock, 'LI')) {
      // Nested list is inside a LI
      const containerBlockParent = getContainerBlock(containerBlock);
      dom.insertAfter(newBlock, containerBlockParent);

      if (isFirstChild(containerBlock)) {
        dom.remove(containerBlockParent);
      } else {
        dom.remove(containerBlock);
      }
    } else {
      // Is first and last list item then replace the OL/UL with a text block
      dom.replace(newBlock, containerBlock);
    }
  } else if (isFirstOrLastLi(containerBlock, parentBlock, true)) {
    if (hasParent(containerBlock, 'LI')) {
      // List nested in an LI then move the list to a new sibling LI
      dom.insertAfter(newBlock, getContainerBlock(containerBlock));
      newBlock.appendChild(dom.doc.createTextNode(' ')); // Needed for IE so the caret can be placed
      newBlock.appendChild(containerBlock);
    } else {
      // First LI in list then remove LI and add text block before list
      containerParent.insertBefore(newBlock, containerBlock);
    }
    dom.remove(parentBlock);
  } else if (isFirstOrLastLi(containerBlock, parentBlock, false)) {
    // Last LI in list then remove LI and add text block after list
    dom.insertAfter(newBlock, getContainerBlock(containerBlock));
    dom.remove(parentBlock);
  } else {
    // Middle LI in list then split the list and insert a text block in the middle
    // Extract after fragment and insert it after the current block
    containerBlock = getContainerBlock(containerBlock);
    const tmpRng = rng.cloneRange();
    tmpRng.setStartAfter(parentBlock);
    tmpRng.setEndAfter(containerBlock);
    const fragment = tmpRng.extractContents();

    if (newBlockName === 'LI' && hasFirstChild(fragment, 'LI')) {
      const previousChildren = Arr.filter(
        Arr.map(newBlock.children, SugarElement.fromDom),
        Fun.not(SugarNode.isTag('br'))
      );

      newBlock = fragment.firstChild as HTMLLIElement;
      dom.insertAfter(fragment, containerBlock);

      Arr.each(previousChildren, (child) => Insert.prepend(SugarElement.fromDom(newBlock), child));
      if (parentBlockStyles) {
        newBlock.setAttribute('style', parentBlockStyles);
      }
    } else {
      dom.insertAfter(fragment, containerBlock);
      dom.insertAfter(newBlock, containerBlock);
    }
    dom.remove(parentBlock);
  }

  NewLineUtils.moveToCaretPosition(editor, newBlock);
};

export {
  insert
};
