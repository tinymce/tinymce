import { Arr, Obj, Optional, Optionals, Type } from '@ephox/katamari';
import { Css, PredicateFilter, SugarElement, SugarNode } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import { SchemaMap } from '../api/html/Schema';
import * as Options from '../api/Options';
import { EditorEvent } from '../api/util/EventDispatcher';
import Tools from '../api/util/Tools';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as CaretContainer from '../caret/CaretContainer';
import * as NodeType from '../dom/NodeType';
import { isCaretNode } from '../fmt/FormatContainer';
import * as NormalizeRange from '../selection/NormalizeRange';
import { isWhitespaceText } from '../text/Whitespace';
import * as Zwsp from '../text/Zwsp';
import * as InsertLi from './InsertLi';
import * as NewLineUtils from './NewLineUtils';

const trimZwsp = (fragment: DocumentFragment) => {
  Arr.each(PredicateFilter.descendants(SugarElement.fromDom(fragment), SugarNode.isText), (text) => {
    const rawNode = text.dom;
    rawNode.nodeValue = Zwsp.trim(rawNode.data);
  });
};

const isWithinNonEditableList = (editor: Editor, node: Node): boolean => {
  const parentList = editor.dom.getParent(node, 'ol,ul,dl');
  return parentList !== null && editor.dom.getContentEditableParent(parentList) === 'false';
};

const isEmptyAnchor = (dom: DOMUtils, elm: Node): boolean => {
  return elm && elm.nodeName === 'A' && dom.isEmpty(elm);
};

const emptyBlock = (elm: Element) => {
  elm.innerHTML = '<br data-mce-bogus="1">';
};

const containerAndSiblingName = (container: Node, nodeName: string) => {
  return container.nodeName === nodeName || (container.previousSibling && container.previousSibling.nodeName === nodeName);
};

// Returns true if the block can be split into two blocks or not
const canSplitBlock = (dom: DOMUtils, node: Node | null): node is Element => {
  return Type.isNonNullable(node) &&
    dom.isBlock(node) &&
    !/^(TD|TH|CAPTION|FORM)$/.test(node.nodeName) &&
    !/^(fixed|absolute)/i.test(node.style.position) &&
    dom.isEditable(node.parentNode) && dom.getContentEditable(node) !== 'false';
};

// Remove the first empty inline element of the block so this: <p><b><em></em></b>x</p> becomes this: <p>x</p>
const trimInlineElementsOnLeftSideOfBlock = (dom: DOMUtils, nonEmptyElementsMap: SchemaMap, block: Element) => {
  const firstChilds = [];

  if (!block) {
    return;
  }

  // Find inner most first child ex: <p><i><b>*</b></i></p>
  let currentNode: Node | null = block;
  while ((currentNode = currentNode.firstChild)) {
    if (dom.isBlock(currentNode)) {
      return;
    }

    if (NodeType.isElement(currentNode) && !nonEmptyElementsMap[currentNode.nodeName.toLowerCase()]) {
      firstChilds.push(currentNode);
    }
  }

  let i = firstChilds.length;
  while (i--) {
    currentNode = firstChilds[i];
    if (!currentNode.hasChildNodes() || (currentNode.firstChild === currentNode.lastChild && currentNode.firstChild?.nodeValue === '')) {
      dom.remove(currentNode);
    } else {
      if (isEmptyAnchor(dom, currentNode)) {
        dom.remove(currentNode);
      }
    }
  }
};

const normalizeZwspOffset = (start: boolean, container: Node, offset: number) => {
  if (!NodeType.isText(container)) {
    return offset;
  } else if (start) {
    return offset === 1 && container.data.charAt(offset - 1) === Zwsp.ZWSP ? 0 : offset;
  } else {
    return offset === container.data.length - 1 && container.data.charAt(offset) === Zwsp.ZWSP ? container.data.length : offset;
  }
};

const includeZwspInRange = (rng: Range) => {
  const newRng = rng.cloneRange();
  newRng.setStart(rng.startContainer, normalizeZwspOffset(true, rng.startContainer, rng.startOffset));
  newRng.setEnd(rng.endContainer, normalizeZwspOffset(false, rng.endContainer, rng.endOffset));
  return newRng;
};

// Trims any linebreaks at the beginning of node user for example when pressing enter in a PRE element
const trimLeadingLineBreaks = (node: Node) => {
  let currentNode: Node | null = node;
  do {
    if (NodeType.isText(currentNode)) {
      currentNode.data = currentNode.data.replace(/^[\r\n]+/, '');
    }

    currentNode = currentNode.firstChild;
  } while (currentNode);
};

const applyAttributes = (editor: Editor, node: Element, forcedRootBlockAttrs: Record<string, string>) => {
  const dom = editor.dom;

  // Merge and apply style attribute
  Optional.from(forcedRootBlockAttrs.style)
    .map(dom.parseStyle)
    .each((attrStyles) => {
      const currentStyles = Css.getAllRaw(SugarElement.fromDom(node));
      const newStyles = { ...currentStyles, ...attrStyles };
      dom.setStyles(node, newStyles);
    });

  // Merge and apply class attribute
  const attrClassesOpt = Optional.from(forcedRootBlockAttrs.class).map((attrClasses) => attrClasses.split(/\s+/));
  const currentClassesOpt = Optional.from(node.className).map((currentClasses) => Arr.filter(currentClasses.split(/\s+/), (clazz) => clazz !== ''));
  Optionals.lift2(attrClassesOpt, currentClassesOpt, (attrClasses, currentClasses) => {
    const filteredClasses = Arr.filter(currentClasses, (clazz) => !Arr.contains(attrClasses, clazz));
    const newClasses = [ ...attrClasses, ...filteredClasses ];
    dom.setAttrib(node, 'class', newClasses.join(' '));
  });

  // Apply any remaining forced root block attributes
  const appliedAttrs = [ 'style', 'class' ];
  const remainingAttrs = Obj.filter(forcedRootBlockAttrs, (_, attrs) => !Arr.contains(appliedAttrs, attrs));
  dom.setAttribs(node, remainingAttrs);
};

const setForcedBlockAttrs = (editor: Editor, node: Element) => {
  const forcedRootBlockName = Options.getForcedRootBlock(editor);

  if (forcedRootBlockName.toLowerCase() === node.tagName.toLowerCase()) {
    const forcedRootBlockAttrs = Options.getForcedRootBlockAttrs(editor);
    applyAttributes(editor, node, forcedRootBlockAttrs);
  }
};

// Wraps any text nodes or inline elements in the specified forced root block name
const wrapSelfAndSiblingsInDefaultBlock = (editor: Editor, newBlockName: string, rng: Range, container: Node, offset: number) => {
  const dom = editor.dom;
  const editableRoot = NewLineUtils.getEditableRoot(dom, container) ?? dom.getRoot();

  // Not in a block element or in a table cell or caption
  let parentBlock = dom.getParent(container, dom.isBlock);
  if (!parentBlock || !canSplitBlock(dom, parentBlock)) {
    parentBlock = parentBlock || editableRoot;

    if (!parentBlock.hasChildNodes()) {
      const newBlock = dom.create(newBlockName);
      setForcedBlockAttrs(editor, newBlock);
      parentBlock.appendChild(newBlock);
      rng.setStart(newBlock, 0);
      rng.setEnd(newBlock, 0);
      return newBlock;
    }

    // Find parent that is the first child of parentBlock
    let node: Node | null = container;
    while (node && node.parentNode !== parentBlock) {
      node = node.parentNode;
    }

    // Loop left to find start node start wrapping at
    let startNode: Node | undefined;
    while (node && !dom.isBlock(node)) {
      startNode = node;
      node = node.previousSibling;
    }

    const startNodeName = startNode?.parentElement?.nodeName;
    if (startNode && startNodeName && editor.schema.isValidChild(startNodeName, newBlockName.toLowerCase())) {
      // This should never be null since we check it above
      const startNodeParent = startNode.parentNode as Node;
      const newBlock = dom.create(newBlockName);
      setForcedBlockAttrs(editor, newBlock);
      startNodeParent.insertBefore(newBlock, startNode);

      // Start wrapping until we hit a block
      node = startNode;
      while (node && !dom.isBlock(node)) {
        const next: Node | null = node.nextSibling;
        newBlock.appendChild(node);
        node = next;
      }

      // Restore range to it's past location
      rng.setStart(container, offset);
      rng.setEnd(container, offset);
    }
  }

  return container;
};

// Adds a BR at the end of blocks that only contains an IMG or INPUT since
// these might be floated and then they won't expand the block
const addBrToBlockIfNeeded = (dom: DOMUtils, block: Node) => {
  // IE will render the blocks correctly other browsers needs a BR
  block.normalize(); // Remove empty text nodes that got left behind by the extract

  // Check if the block is empty or contains a floated last child
  const lastChild = block.lastChild;
  if (!lastChild || NodeType.isElement(lastChild) && (/^(left|right)$/gi.test(dom.getStyle(lastChild, 'float', true)))) {
    dom.add(block, 'br');
  }
};

const shouldEndContainer = (editor: Editor, container: Node | null | undefined) => {
  const optionValue = Options.shouldEndContainerOnEmptyBlock(editor);
  if (Type.isNullable(container)) {
    return false;
  } else if (Type.isString(optionValue)) {
    return Arr.contains(Tools.explode(optionValue), container.nodeName.toLowerCase());
  } else {
    return optionValue;
  }
};

const insert = (editor: Editor, evt?: EditorEvent<KeyboardEvent>): void => {
  let container: Node;
  let offset: number;
  let parentBlockName: string;
  let containerBlock: Node | null;
  let isAfterLastNodeInContainer = false;
  const dom = editor.dom;
  const schema = editor.schema, nonEmptyElementsMap = schema.getNonEmptyElements();
  const rng = editor.selection.getRng();
  const newBlockName = Options.getForcedRootBlock(editor);

  // Creates a new block element by cloning the current one or creating a new one if the name is specified
  // This function will also copy any text formatting from the parent block and add it to the new one
  const createNewBlock = (name?: string): Element => {
    let node: Node | null = container;
    const textInlineElements = schema.getTextInlineElements();

    let block: Element;
    if (name || parentBlockName === 'TABLE' || parentBlockName === 'HR') {
      block = dom.create(name || newBlockName);
    } else {
      block = parentBlock.cloneNode(false) as Element;
    }

    let caretNode = block;

    if (Options.shouldKeepStyles(editor) === false) {
      dom.setAttrib(block, 'style', null); // wipe out any styles that came over with the block
      dom.setAttrib(block, 'class', null);
    } else {
      // Clone any parent styles
      do {
        if (textInlineElements[node.nodeName]) {
          // Ignore caret or bookmark nodes when cloning
          if (isCaretNode(node) || Bookmarks.isBookmarkNode(node)) {
            continue;
          }

          const clonedNode = node.cloneNode(false) as Element;
          dom.setAttrib(clonedNode, 'id', ''); // Remove ID since it needs to be document unique

          if (block.hasChildNodes()) {
            clonedNode.appendChild(block.firstChild as Node);
            block.appendChild(clonedNode);
          } else {
            caretNode = clonedNode;
            block.appendChild(clonedNode);
          }
        }
      } while ((node = node.parentNode) && node !== editableRoot);
    }

    setForcedBlockAttrs(editor, block);

    emptyBlock(caretNode);

    return block;
  };

  // Returns true/false if the caret is at the start/end of the parent block element
  const isCaretAtStartOrEndOfBlock = (start: boolean) => {
    const normalizedOffset = normalizeZwspOffset(start, container, offset);

    // Caret is in the middle of a text node like "a|b"
    if (NodeType.isText(container) && (start ? normalizedOffset > 0 : normalizedOffset < container.data.length)) {
      return false;
    }

    // If after the last element in block node edge case for #5091
    if (container.parentNode === parentBlock && isAfterLastNodeInContainer && !start) {
      return true;
    }

    // If the caret if before the first element in parentBlock
    if (start && NodeType.isElement(container) && container === parentBlock.firstChild) {
      return true;
    }

    // Caret can be before/after a table or a hr
    if (containerAndSiblingName(container, 'TABLE') || containerAndSiblingName(container, 'HR')) {
      return (isAfterLastNodeInContainer && !start) || (!isAfterLastNodeInContainer && start);
    }

    // Walk the DOM and look for text nodes or non empty elements
    const walker = new DomTreeWalker(container, parentBlock);

    // If caret is in beginning or end of a text block then jump to the next/previous node
    if (NodeType.isText(container)) {
      if (start && normalizedOffset === 0) {
        walker.prev();
      } else if (!start && normalizedOffset === container.data.length) {
        walker.next();
      }
    }

    let node: Node | null | undefined;
    while ((node = walker.current())) {
      if (NodeType.isElement(node)) {
        // Ignore bogus elements
        if (!node.getAttribute('data-mce-bogus')) {
          // Keep empty elements like <img /> <input /> but not trailing br:s like <p>text|<br></p>
          const name = node.nodeName.toLowerCase();
          if (nonEmptyElementsMap[name] && name !== 'br') {
            return false;
          }
        }
      } else if (NodeType.isText(node) && !isWhitespaceText(node.data)) {
        return false;
      }

      if (start) {
        walker.prev();
      } else {
        walker.next();
      }
    }

    return true;
  };

  const insertNewBlockAfter = () => {
    let block: Element;
    // If the caret is at the end of a header we produce a P tag after it similar to Word unless we are in a hgroup
    if (/^(H[1-6]|PRE|FIGURE)$/.test(parentBlockName) && containerBlockName !== 'HGROUP') {
      block = createNewBlock(newBlockName);
    } else {
      block = createNewBlock();
    }

    // Split the current container block element if enter is pressed inside an empty inner block element
    if (shouldEndContainer(editor, containerBlock) && canSplitBlock(dom, containerBlock) && dom.isEmpty(parentBlock)) {
      // Split container block for example a BLOCKQUOTE at the current blockParent location for example a P
      block = dom.split(containerBlock, parentBlock) as Element;
    } else {
      dom.insertAfter(block, parentBlock);
    }

    NewLineUtils.moveToCaretPosition(editor, block);
    return block;
  };

  // Setup range items and newBlockName
  NormalizeRange.normalize(dom, rng).each((normRng) => {
    rng.setStart(normRng.startContainer, normRng.startOffset);
    rng.setEnd(normRng.endContainer, normRng.endOffset);
  });

  container = rng.startContainer;
  offset = rng.startOffset;
  const shiftKey = !!(evt && evt.shiftKey);
  const ctrlKey = !!(evt && evt.ctrlKey);

  // Resolve node index
  if (NodeType.isElement(container) && container.hasChildNodes()) {
    isAfterLastNodeInContainer = offset > container.childNodes.length - 1;

    container = container.childNodes[Math.min(offset, container.childNodes.length - 1)] || container;
    if (isAfterLastNodeInContainer && NodeType.isText(container)) {
      offset = container.data.length;
    } else {
      offset = 0;
    }
  }

  // Get editable root node, normally the body element but sometimes a div or span
  const editableRoot = NewLineUtils.getEditableRoot(dom, container);

  // If there is no editable root then enter is done inside a contentEditable false element
  if (!editableRoot || isWithinNonEditableList(editor, container)) {
    return;
  }

  // Wrap the current node and it's sibling in a default block if it's needed.
  // for example this <td>text|<b>text2</b></td> will become this <td><p>text|<b>text2</p></b></td>
  // This won't happen if root blocks are disabled or the shiftKey is pressed
  if (!shiftKey) {
    container = wrapSelfAndSiblingsInDefaultBlock(editor, newBlockName, rng, container, offset);
  }

  // Find parent block and setup empty block paddings
  let parentBlock: HTMLElement = dom.getParent(container, dom.isBlock) || dom.getRoot();
  containerBlock = Type.isNonNullable(parentBlock?.parentNode) ? dom.getParent(parentBlock.parentNode, dom.isBlock) : null;

  // Setup block names
  parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
  const containerBlockName = containerBlock ? containerBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5

  // Enter inside block contained within a LI then split or insert before/after LI
  if (containerBlockName === 'LI' && !ctrlKey) {
    const liBlock = containerBlock as HTMLLIElement;
    parentBlock = liBlock;
    containerBlock = liBlock.parentNode;
    parentBlockName = containerBlockName;
  }

  // Handle enter in list item
  if (/^(LI|DT|DD)$/.test(parentBlockName) && NodeType.isElement(containerBlock)) {
    // Handle enter inside an empty list item
    if (dom.isEmpty(parentBlock)) {
      InsertLi.insert(editor, createNewBlock, containerBlock, parentBlock, newBlockName);
      return;
    }
  }

  // Never split the body or blocks that we can't split like noneditable host elements
  if (parentBlock === editor.getBody() || !canSplitBlock(dom, parentBlock)) {
    return;
  }
  const parentBlockParent = parentBlock.parentNode;

  // Insert new block before/after the parent block depending on caret location
  let newBlock: Element;
  if (CaretContainer.isCaretContainerBlock(parentBlock)) {
    newBlock = CaretContainer.showCaretContainerBlock(parentBlock) as Element;
    if (dom.isEmpty(parentBlock)) {
      emptyBlock(parentBlock);
    }
    setForcedBlockAttrs(editor, newBlock);
    NewLineUtils.moveToCaretPosition(editor, newBlock);
  } else if (isCaretAtStartOrEndOfBlock(false)) {
    newBlock = insertNewBlockAfter();
  } else if (isCaretAtStartOrEndOfBlock(true) && parentBlockParent) {
    // Insert new block before
    newBlock = parentBlockParent.insertBefore(createNewBlock(), parentBlock);
    NewLineUtils.moveToCaretPosition(editor, containerAndSiblingName(parentBlock, 'HR') ? newBlock : parentBlock);
  } else {
    // Extract after fragment and insert it after the current block
    const tmpRng = includeZwspInRange(rng).cloneRange();
    tmpRng.setEndAfter(parentBlock);
    const fragment = tmpRng.extractContents();
    trimZwsp(fragment);
    trimLeadingLineBreaks(fragment);
    newBlock = fragment.firstChild as Element;
    dom.insertAfter(fragment, parentBlock);
    trimInlineElementsOnLeftSideOfBlock(dom, nonEmptyElementsMap, newBlock);
    addBrToBlockIfNeeded(dom, parentBlock);

    if (dom.isEmpty(parentBlock)) {
      emptyBlock(parentBlock);
    }

    newBlock.normalize();

    // New block might become empty if it's <p><b>a |</b></p>
    if (dom.isEmpty(newBlock)) {
      dom.remove(newBlock);
      insertNewBlockAfter();
    } else {
      setForcedBlockAttrs(editor, newBlock);
      NewLineUtils.moveToCaretPosition(editor, newBlock);
    }
  }

  dom.setAttrib(newBlock, 'id', ''); // Remove ID since it needs to be document unique

  // Allow custom handling of new blocks
  editor.dispatch('NewBlock', { newBlock });
};

const fakeEventName = 'insertParagraph';

export const blockbreak = {
  insert,
  fakeEventName
};
