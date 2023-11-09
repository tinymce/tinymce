import { Arr, Fun, Obj, Optional, Strings, Type, Unicode } from '@ephox/katamari';
import { Attribute, Insert, Remove, SugarElement, SugarNode } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as DeleteElement from '../delete/DeleteElement';
import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as SplitRange from '../selection/SplitRange';
import * as Zwsp from '../text/Zwsp';
import * as ExpandRange from './ExpandRange';
import { CARET_ID, getParentCaretContainer, isCaretNode } from './FormatContainer';
import { FormatVars } from './FormatTypes';
import * as FormatUtils from './FormatUtils';
import * as MatchFormat from './MatchFormat';

const ZWSP = Zwsp.ZWSP;

const importNode = (ownerDocument: Document, node: Node) => {
  return ownerDocument.importNode(node, true);
};

const findFirstTextNode = (node: Node | null): Text | null => {
  if (node) {
    const walker = new DomTreeWalker(node, node);

    for (let tempNode = walker.current(); tempNode; tempNode = walker.next()) {
      if (NodeType.isText(tempNode)) {
        return tempNode;
      }
    }
  }

  return null;
};

const createCaretContainer = (fill: boolean) => {
  const caretContainer = SugarElement.fromTag('span');

  Attribute.setAll(caretContainer, {
    // style: 'color:red',
    'id': CARET_ID,
    'data-mce-bogus': '1',
    'data-mce-type': 'format-caret'
  });

  if (fill) {
    Insert.append(caretContainer, SugarElement.fromText(ZWSP));
  }

  return caretContainer;
};

const trimZwspFromCaretContainer = (caretContainerNode: Node) => {
  const textNode = findFirstTextNode(caretContainerNode);
  if (textNode && textNode.data.charAt(0) === ZWSP) {
    textNode.deleteData(0, 1);
  }

  return textNode;
};
const removeCaretContainerNode = (editor: Editor, node: Node, moveCaret: boolean) => {
  const dom = editor.dom, selection = editor.selection;

  if (FormatUtils.isCaretContainerEmpty(node)) {
    DeleteElement.deleteElement(editor, false, SugarElement.fromDom(node), moveCaret, true);
  } else {
    const rng = selection.getRng();
    const block = dom.getParent(node, dom.isBlock);

    // Store the current selection offsets
    const startContainer = rng.startContainer;
    const startOffset = rng.startOffset;
    const endContainer = rng.endContainer;
    const endOffset = rng.endOffset;

    const textNode = trimZwspFromCaretContainer(node);
    dom.remove(node, true);

    // Restore the selection after unwrapping the node and removing the zwsp
    if (startContainer === textNode && startOffset > 0) {
      rng.setStart(textNode, startOffset - 1);
    }

    if (endContainer === textNode && endOffset > 0) {
      rng.setEnd(textNode, endOffset - 1);
    }

    if (block && dom.isEmpty(block)) {
      PaddingBr.fillWithPaddingBr(SugarElement.fromDom(block));
    }

    selection.setRng(rng);
  }
};

// Removes the caret container for the specified node or all on the current document
const removeCaretContainer = (editor: Editor, node: Node | null, moveCaret: boolean) => {
  const dom = editor.dom, selection = editor.selection;
  if (!node) {
    node = getParentCaretContainer(editor.getBody(), selection.getStart());

    if (!node) {
      while ((node = dom.get(CARET_ID))) {
        removeCaretContainerNode(editor, node, moveCaret);
      }
    }
  } else {
    removeCaretContainerNode(editor, node, moveCaret);
  }
};

const insertCaretContainerNode = (editor: Editor, caretContainer: Node, formatNode: Node) => {
  const dom = editor.dom;
  const block = dom.getParent(formatNode, Fun.curry(FormatUtils.isTextBlock, editor.schema));

  if (block && dom.isEmpty(block)) {
    // Replace formatNode with caretContainer when removing format from empty block like <p><b>|</b></p>
    formatNode.parentNode?.replaceChild(caretContainer, formatNode);
  } else {
    PaddingBr.removeTrailingBr(SugarElement.fromDom(formatNode));
    if (dom.isEmpty(formatNode)) {
      formatNode.parentNode?.replaceChild(caretContainer, formatNode);
    } else {
      dom.insertAfter(caretContainer, formatNode);
    }
  }
};

const appendNode = (parentNode: Node, node: Node) => {
  parentNode.appendChild(node);
  return node;
};

const insertFormatNodesIntoCaretContainer = (formatNodes: Node[], caretContainer: Node) => {
  const innerMostFormatNode = Arr.foldr(formatNodes, (parentNode, formatNode) => {
    return appendNode(parentNode, formatNode.cloneNode(false));
  }, caretContainer);

  const doc = innerMostFormatNode.ownerDocument ?? document;
  return appendNode(innerMostFormatNode, doc.createTextNode(ZWSP));
};

const cleanFormatNode = (editor: Editor, caretContainer: Node, formatNode: Element, name: string, vars?: FormatVars, similar?: boolean): Optional<Node> => {
  const formatter = editor.formatter;
  const dom = editor.dom;

  // Find all formats present on the format node
  const validFormats = Arr.filter(Obj.keys(formatter.get()), (formatName) => formatName !== name && !Strings.contains(formatName, 'removeformat'));
  const matchedFormats = MatchFormat.matchAllOnNode(editor, formatNode, validFormats);
  // Filter out any matched formats that are 'visually' equivalent to the 'name' format since they are not unique formats on the node
  const uniqueFormats = Arr.filter(matchedFormats, (fmtName) => !FormatUtils.areSimilarFormats(editor, fmtName, name));

  // If more than one format is present, then there's additional formats that should be retained. So clone the node,
  // remove the format and then return cleaned format node
  if (uniqueFormats.length > 0) {
    const clonedFormatNode = formatNode.cloneNode(false) as Element;
    dom.add(caretContainer, clonedFormatNode);
    formatter.remove(name, vars, clonedFormatNode, similar);
    dom.remove(clonedFormatNode);
    return Optional.some(clonedFormatNode);
  } else {
    return Optional.none();
  }
};

const applyCaretFormat = (editor: Editor, name: string, vars?: FormatVars): void => {
  let caretContainer: Node | null;
  const selection = editor.selection;

  const formatList = editor.formatter.get(name);
  if (!formatList) {
    return;
  }

  const selectionRng = selection.getRng();
  let offset = selectionRng.startOffset;
  const container = selectionRng.startContainer;
  const text = container.nodeValue;

  caretContainer = getParentCaretContainer(editor.getBody(), selection.getStart());

  // Expand to word if caret is in the middle of a text node and the char before/after is a alpha numeric character
  const wordcharRegex = /[^\s\u00a0\u00ad\u200b\ufeff]/;
  if (text && offset > 0 && offset < text.length &&
    wordcharRegex.test(text.charAt(offset)) && wordcharRegex.test(text.charAt(offset - 1))) {
    // Get bookmark of caret position
    const bookmark = selection.getBookmark();

    // Collapse bookmark range (WebKit)
    selectionRng.collapse(true);

    // Expand the range to the closest word and split it at those points
    let rng = ExpandRange.expandRng(editor.dom, selectionRng, formatList);
    rng = SplitRange.split(rng);

    // Apply the format to the range
    editor.formatter.apply(name, vars, rng);

    // Move selection back to caret position
    selection.moveToBookmark(bookmark);
  } else {
    let textNode = caretContainer ? findFirstTextNode(caretContainer) : null;

    if (!caretContainer || textNode?.data !== ZWSP) {
      // Need to import the node into the document on IE or we get a lovely WrongDocument exception
      caretContainer = importNode(editor.getDoc(), createCaretContainer(true).dom);
      textNode = caretContainer.firstChild as Text;

      selectionRng.insertNode(caretContainer);
      offset = 1;

      editor.formatter.apply(name, vars, caretContainer);
    } else {
      editor.formatter.apply(name, vars, caretContainer);
    }

    // Move selection to text node
    selection.setCursorLocation(textNode, offset);
  }
};

const removeCaretFormat = (editor: Editor, name: string, vars?: FormatVars, similar?: boolean): void => {
  const dom = editor.dom;
  const selection = editor.selection;
  let hasContentAfter = false;

  const formatList = editor.formatter.get(name);
  if (!formatList) {
    return;
  }

  const rng = selection.getRng();
  const container = rng.startContainer;
  const offset = rng.startOffset;
  let node: Node | null = container;

  if (NodeType.isText(container)) {
    if (offset !== container.data.length) {
      hasContentAfter = true;
    }

    node = node.parentNode;
  }

  const parents: Node[] = [];
  let formatNode: Element | undefined;
  while (node) {
    if (MatchFormat.matchNode(editor, node, name, vars, similar)) {
      formatNode = node as Element;
      break;
    }

    if (node.nextSibling) {
      hasContentAfter = true;
    }

    parents.push(node);
    node = node.parentNode;
  }

  // Node doesn't have the specified format
  if (!formatNode) {
    return;
  }

  // Is there contents after the caret then remove the format on the element
  if (hasContentAfter) {
    const bookmark = selection.getBookmark();

    // Collapse bookmark range (WebKit)
    rng.collapse(true);

    // Expand the range to the closest word and split it at those points
    let expandedRng = ExpandRange.expandRng(dom, rng, formatList, true);
    expandedRng = SplitRange.split(expandedRng);

    // TODO: Figure out how on earth this works, as it shouldn't since remove format
    //  definitely seems to require an actual Range
    editor.formatter.remove(name, vars, expandedRng as Range, similar);
    selection.moveToBookmark(bookmark);
  } else {
    const caretContainer = getParentCaretContainer(editor.getBody(), formatNode);
    const parentsAfter = Type.isNonNullable(caretContainer) ? dom.getParents(formatNode.parentNode, Fun.always, caretContainer) : [];
    const newCaretContainer = createCaretContainer(false).dom;

    insertCaretContainerNode(editor, newCaretContainer, caretContainer ?? formatNode);

    const cleanedFormatNode = cleanFormatNode(editor, newCaretContainer, formatNode, name, vars, similar);
    const caretTextNode = insertFormatNodesIntoCaretContainer([
      ...parents,
      ...cleanedFormatNode.toArray(),
      ...parentsAfter ], newCaretContainer);
    if (caretContainer) {
      removeCaretContainerNode(editor, caretContainer, Type.isNonNullable(caretContainer));
    }
    selection.setCursorLocation(caretTextNode, 1);

    if (dom.isEmpty(formatNode)) {
      dom.remove(formatNode);
    }
  }
};

const disableCaretContainer = (editor: Editor, keyCode: number, moveCaret: boolean) => {
  const selection = editor.selection, body = editor.getBody();

  removeCaretContainer(editor, null, moveCaret);

  // Remove caret container if it's empty
  if ((keyCode === 8 || keyCode === 46) && selection.isCollapsed() && selection.getStart().innerHTML === ZWSP) {
    removeCaretContainer(editor, getParentCaretContainer(body, selection.getStart()), true);
  }

  // Remove caret container on keydown and it's left/right arrow keys
  if (keyCode === 37 || keyCode === 39) {
    removeCaretContainer(editor, getParentCaretContainer(body, selection.getStart()), true);
  }
};

const endsWithNbsp = (element: Node) => NodeType.isText(element) && Strings.endsWith(element.data, Unicode.nbsp);

const setup = (editor: Editor): void => {
  editor.on('mouseup keydown', (e) => {
    disableCaretContainer(editor, e.keyCode, endsWithNbsp(editor.selection.getRng().endContainer));
  });
};

const createCaretFormat = (formatNodes: Node[]): {
  caretContainer: SugarElement<HTMLSpanElement>;
  caretPosition: CaretPosition;
} => {
  const caretContainer = createCaretContainer(false);
  const innerMost = insertFormatNodesIntoCaretContainer(formatNodes, caretContainer.dom);
  return { caretContainer, caretPosition: CaretPosition(innerMost, 0) };
};

const replaceWithCaretFormat = (targetNode: Node, formatNodes: Node[]): CaretPosition => {
  const { caretContainer, caretPosition } = createCaretFormat(formatNodes);
  Insert.before(SugarElement.fromDom(targetNode), caretContainer);
  Remove.remove(SugarElement.fromDom(targetNode));

  return caretPosition;
};

const createCaretFormatAtStart = (rng: Range, formatNodes: Node[]): CaretPosition => {
  const { caretContainer, caretPosition } = createCaretFormat(formatNodes);
  rng.insertNode(caretContainer.dom);

  return caretPosition;
};

const isFormatElement = (editor: Editor, element: SugarElement<Node>): boolean => {
  if (isCaretNode(element.dom)) {
    return false;
  }
  const inlineElements = editor.schema.getTextInlineElements();
  return Obj.has(inlineElements, SugarNode.name(element)) && !isCaretNode(element.dom) && !NodeType.isBogus(element.dom);
};

const isFormatCaret = (editor: Editor, element: SugarElement<Node>): boolean => {
  const inlineElements = editor.schema.getTextInlineElements();
  return Obj.has(inlineElements, SugarNode.name(element)) && isCaretNode(element.dom);
};

export {
  setup,
  applyCaretFormat,
  removeCaretFormat,
  replaceWithCaretFormat,
  createCaretFormatAtStart,
  isFormatElement,
  isFormatCaret
};
