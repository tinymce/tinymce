import { Arr, Fun, Obj, Optional, Optionals, Unicode } from '@ephox/katamari';
import { Css, SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import * as Bookmarks from '../bookmark/Bookmarks';
import * as ElementType from '../dom/ElementType';
import * as NodeType from '../dom/NodeType';
import * as ScrollIntoView from '../dom/ScrollIntoView';
import { isCaretNode } from '../fmt/FormatContainer';

const firstNonWhiteSpaceNodeSibling = (node: Node | null): Node | null => {
  while (node) {
    if (NodeType.isElement(node) || (NodeType.isText(node) && node.data && /[\r\n\s]/.test(node.data))) {
      return node;
    }

    node = node.nextSibling;
  }

  return null;
};

const moveToCaretPosition = (editor: Editor, root: Node): void => {
  const dom = editor.dom;
  const moveCaretBeforeOnEnterElementsMap = editor.schema.getMoveCaretBeforeOnEnterElements();

  if (!root) {
    return;
  }

  if (/^(LI|DT|DD)$/.test(root.nodeName)) {
    const firstChild = firstNonWhiteSpaceNodeSibling(root.firstChild);

    if (firstChild && /^(UL|OL|DL)$/.test(firstChild.nodeName)) {
      root.insertBefore(dom.doc.createTextNode(Unicode.nbsp), root.firstChild);
    }
  }

  const rng = dom.createRng();
  root.normalize();

  if (root.hasChildNodes()) {
    const walker = new DomTreeWalker(root, root);
    let lastNode = root;
    let node: Node | null | undefined;

    while ((node = walker.current())) {
      if (NodeType.isText(node)) {
        rng.setStart(node, 0);
        rng.setEnd(node, 0);
        break;
      }

      if (moveCaretBeforeOnEnterElementsMap[node.nodeName.toLowerCase()]) {
        rng.setStartBefore(node);
        rng.setEndBefore(node);
        break;
      }

      lastNode = node;
      node = walker.next();
    }

    if (!node) {
      rng.setStart(lastNode, 0);
      rng.setEnd(lastNode, 0);
    }
  } else {
    if (NodeType.isBr(root)) {
      if (root.nextSibling && dom.isBlock(root.nextSibling)) {
        rng.setStartBefore(root);
        rng.setEndBefore(root);
      } else {
        rng.setStartAfter(root);
        rng.setEndAfter(root);
      }
    } else {
      rng.setStart(root, 0);
      rng.setEnd(root, 0);
    }
  }

  editor.selection.setRng(rng);
  ScrollIntoView.scrollRangeIntoView(editor, rng);
};

const getEditableRoot = (dom: DOMUtils, node: Node): HTMLElement | undefined => {
  const root = dom.getRoot();
  let editableRoot: HTMLElement | undefined;

  // Get all parents until we hit a non editable parent or the root
  let parent: Node | null = node;
  while (parent !== root && parent && dom.getContentEditable(parent) !== 'false') {
    if (dom.getContentEditable(parent) === 'true') {
      editableRoot = parent as HTMLElement;
      break;
    }

    parent = parent.parentNode;
  }

  return parent !== root ? editableRoot : root;
};

const getParentBlock = (editor: Editor): Optional<Element> => {
  return Optional.from(editor.dom.getParent(editor.selection.getStart(true), editor.dom.isBlock));
};

const getParentBlockName = (editor: Editor): string => {
  return getParentBlock(editor).fold(
    Fun.constant(''),
    (parentBlock) => {
      return parentBlock.nodeName.toUpperCase();
    }
  );
};

const isListItemParentBlock = (editor: Editor): boolean => {
  return getParentBlock(editor).filter((elm) => {
    return ElementType.isListItem(SugarElement.fromDom(elm));
  }).isSome();
};

const emptyBlock = (elm: Element): void => {
  elm.innerHTML = '<br data-mce-bogus="1">';
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

const setForcedBlockAttrs = (editor: Editor, node: Element): void => {
  const forcedRootBlockName = Options.getForcedRootBlock(editor);

  if (forcedRootBlockName.toLowerCase() === node.tagName.toLowerCase()) {
    const forcedRootBlockAttrs = Options.getForcedRootBlockAttrs(editor);
    applyAttributes(editor, node, forcedRootBlockAttrs);
  }
};

// Creates a new block element by cloning the current one or creating a new one if the name is specified
// This function will also copy any text formatting from the parent block and add it to the new one
const createNewBlock = (
  editor: Editor,
  container: Node,
  parentBlock: Node,
  editableRoot: HTMLElement | undefined,
  keepStyles: boolean = true,
  name?: string,
  styles?: Record<string, string>
): Element => {
  const dom = editor.dom;
  const schema = editor.schema;
  const newBlockName = Options.getForcedRootBlock(editor);
  const parentBlockName = parentBlock ? parentBlock.nodeName.toUpperCase() : ''; // IE < 9 & HTML5
  let node: Node | null = container;
  const textInlineElements = schema.getTextInlineElements();

  let block: Element;
  if (name || parentBlockName === 'TABLE' || parentBlockName === 'HR') {
    block = dom.create(name || newBlockName, styles || {});
  } else {
    block = parentBlock.cloneNode(false) as Element;
  }

  let caretNode = block;

  if (!keepStyles) {
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

export {
  moveToCaretPosition,
  getEditableRoot,
  getParentBlock,
  getParentBlockName,
  isListItemParentBlock,
  createNewBlock,
  setForcedBlockAttrs,
  emptyBlock
};
