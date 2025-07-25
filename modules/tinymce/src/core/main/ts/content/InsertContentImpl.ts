import { Arr, Optional, Type } from '@ephox/katamari';
import { Remove, SugarElement, SugarElements } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import { ParserArgs } from '../api/html/DomParser';
import AstNode from '../api/html/Node';
import Schema from '../api/html/Schema';
import HtmlSerializer from '../api/html/Serializer';
import * as StyleUtils from '../api/html/StyleUtils';
import Tools from '../api/util/Tools';
import CaretPosition from '../caret/CaretPosition';
import { CaretWalker } from '../caret/CaretWalker';
import * as TransparentElements from '../content/TransparentElements';
import * as TableDelete from '../delete/TableDelete';
import * as CefUtils from '../dom/CefUtils';
import ElementUtils from '../dom/ElementUtils';
import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as NormalizeTagOrder from '../fmt/NormalizeTagOrder';
import * as AstNodeType from '../html/AstNodeType';
import * as FilterNode from '../html/FilterNode';
import * as InvalidNodes from '../html/InvalidNodes';
import * as ParserUtils from '../html/ParserUtils';
import * as RangeNormalizer from '../selection/RangeNormalizer';
import * as SelectionUtils from '../selection/SelectionUtils';
import * as SetSelectionContent from '../selection/SetSelectionContent';
import * as Zwsp from '../text/Zwsp';

import { InsertContentDetails } from './ContentTypes';
import * as InsertList from './InsertList';

const mergeableWrappedElements = [ 'pre' ];

const shouldPasteContentOnly = (dom: DOMUtils, fragment: AstNode, parentNode: Element, root: Node): boolean => {
  const firstNode = fragment.firstChild as AstNode;
  const lastNode = fragment.lastChild as AstNode;
  const last = lastNode.attr('data-mce-type') === 'bookmark' ? lastNode.prev : lastNode;

  const isPastingSingleElement = firstNode === last;
  const isWrappedElement = Arr.contains(mergeableWrappedElements, firstNode.name);
  if (isPastingSingleElement && isWrappedElement) {
    const isContentEditable = firstNode.attr('contenteditable') !== 'false';
    const isPastingInTheSameBlockTag = dom.getParent(parentNode, dom.isBlock)?.nodeName.toLowerCase() === firstNode.name;
    const isPastingInContentEditable = Optional.from(CefUtils.getContentEditableRoot(root, parentNode)).forall(NodeType.isContentEditableTrue);

    return isContentEditable && isPastingInTheSameBlockTag && isPastingInContentEditable;
  } else {
    return false;
  }
};

const isTableCell = NodeType.isTableCell;

const isTableCellContentSelected = (dom: DOMUtils, rng: Range, cell: Node | null): boolean => {
  if (Type.isNonNullable(cell)) {
    const endCell = dom.getParent(rng.endContainer, isTableCell);
    return cell === endCell && SelectionUtils.hasAllContentsSelected(SugarElement.fromDom(cell), rng);
  } else {
    return false;
  }
};

const isEditableEmptyBlock = (dom: DOMUtils, node: Node): boolean => {
  if (dom.isBlock(node) && dom.isEditable(node)) {
    const childNodes = node.childNodes;
    return (childNodes.length === 1 && NodeType.isBr(childNodes[0])) || childNodes.length === 0;
  } else {
    return false;
  }
};

const validInsertion = (editor: Editor, value: string, parentNode: Element): void => {
  // Should never insert content into bogus elements, since these can
  // be resize handles or similar
  if (parentNode.getAttribute('data-mce-bogus') === 'all') {
    parentNode.parentNode?.insertBefore(editor.dom.createFragment(value), parentNode);
  } else {
    if (isEditableEmptyBlock(editor.dom, parentNode)) {
      editor.dom.setHTML(parentNode, value);
    } else {
      SetSelectionContent.setContentInternal(editor, value, { no_events: true });
    }
  }
};

const trimBrsFromTableCell = (dom: DOMUtils, elm: Element, schema: Schema): void => {
  Optional.from(dom.getParent(elm, 'td,th')).map(SugarElement.fromDom).each((el) => PaddingBr.trimBlockTrailingBr(el, schema));
};

// Remove children nodes that are exactly the same as a parent node - name, attributes, styles
const reduceInlineTextElements = (editor: Editor, merge: boolean | undefined): void => {
  const textInlineElements = editor.schema.getTextInlineElements();
  const dom = editor.dom;

  if (merge) {
    const root = editor.getBody();
    const elementUtils = ElementUtils(editor);

    const fragmentSelector = '*[data-mce-fragment]';
    const fragments = dom.select(fragmentSelector);

    Tools.each(fragments, (node) => {
      const isInline = (currentNode: Element) => Type.isNonNullable(textInlineElements[currentNode.nodeName.toLowerCase()]);
      const hasOneChild = (currentNode: Element) => currentNode.childNodes.length === 1;
      const hasNoNonInheritableStyles = (currentNode: Element) => !(StyleUtils.hasNonInheritableStyles(dom, currentNode) || StyleUtils.hasConditionalNonInheritableStyles(dom, currentNode));

      if (hasNoNonInheritableStyles(node) && isInline(node) && hasOneChild(node)) {
        const styles = StyleUtils.getStyleProps(dom, node);
        const isOverridden = (oldStyles: string[], newStyles: string[]) => Arr.forall(oldStyles, (style) => Arr.contains(newStyles, style));
        const overriddenByAllChildren = (childNode: Element): boolean => hasOneChild(node) && dom.is(childNode, fragmentSelector) && isInline(childNode) &&
          (childNode.nodeName === node.nodeName && isOverridden(styles, StyleUtils.getStyleProps(dom, childNode)) || overriddenByAllChildren(childNode.children[0]));

        const identicalToParent = (parentNode: Element | null): boolean => Type.isNonNullable(parentNode) && parentNode !== root
          && (elementUtils.compare(node, parentNode) || identicalToParent(parentNode.parentElement));

        const conflictWithInsertedParent = (parentNode: Element | null): boolean => Type.isNonNullable(parentNode) && parentNode !== root
          && dom.is(parentNode, fragmentSelector) && (StyleUtils.hasStyleConflict(dom, node, parentNode) || conflictWithInsertedParent(parentNode.parentElement));

        if (overriddenByAllChildren(node.children[0]) || (identicalToParent(node.parentElement) && !conflictWithInsertedParent(node.parentElement))) {
          dom.remove(node, true);
        }
      }
    });

    NormalizeTagOrder.normalizeElements(editor, SugarElements.fromDom(fragments));
  }
};

const markFragmentElements = (fragment: AstNode): void => {
  let node: AstNode | null | undefined = fragment;

  while ((node = node.walk())) {
    if (node.type === 1) {
      node.attr('data-mce-fragment', '1');
    }
  }
};

const unmarkFragmentElements = (elm: Element): void => {
  Tools.each(elm.getElementsByTagName('*'), (elm) => {
    elm.removeAttribute('data-mce-fragment');
  });
};

const isPartOfFragment = (node: Element): boolean => {
  return !!node.getAttribute('data-mce-fragment');
};

const canHaveChildren = (editor: Editor, node: Node | undefined): boolean => {
  return Type.isNonNullable(node) && !editor.schema.getVoidElements()[node.nodeName];
};

const moveSelectionToMarker = (editor: Editor, marker: HTMLElement | null): void => {
  let nextRng: Range | null | undefined;
  const dom = editor.dom;
  const selection = editor.selection;

  if (!marker) {
    return;
  }

  selection.scrollIntoView(marker);

  // If marker is in cE=false then move selection to that element instead
  const parentEditableElm = CefUtils.getContentEditableRoot(editor.getBody(), marker);
  if (parentEditableElm && dom.getContentEditable(parentEditableElm) === 'false') {
    dom.remove(marker);
    selection.select(parentEditableElm);
    return;
  }

  // Move selection before marker and remove it
  let rng = dom.createRng();

  // If previous sibling is a text node set the selection to the end of that node
  const node = marker.previousSibling;
  if (NodeType.isText(node)) {
    rng.setStart(node, node.nodeValue?.length ?? 0);

    const node2 = marker.nextSibling;
    if (NodeType.isText(node2)) {
      node.appendData(node2.data);
      node2.parentNode?.removeChild(node2);
    }
  } else {
    // If the previous sibling isn't a text node or doesn't exist set the selection before the marker node
    rng.setStartBefore(marker);
    rng.setEndBefore(marker);
  }

  const findNextCaretRng = (rng: Range): Range | undefined => {
    let caretPos: CaretPosition | null = CaretPosition.fromRangeStart(rng);
    const caretWalker = CaretWalker(editor.getBody());

    caretPos = caretWalker.next(caretPos);
    return caretPos?.toRange();
  };

  // Remove the marker node and set the new range
  const parentBlock = dom.getParent(marker, dom.isBlock);
  dom.remove(marker);

  if (parentBlock && dom.isEmpty(parentBlock)) {
    const isCell = isTableCell(parentBlock);

    Remove.empty(SugarElement.fromDom(parentBlock));

    rng.setStart(parentBlock, 0);
    rng.setEnd(parentBlock, 0);

    if (!isCell && !isPartOfFragment(parentBlock) && (nextRng = findNextCaretRng(rng))) {
      rng = nextRng;
      dom.remove(parentBlock);
    } else {
      // TINY-9860: If parentBlock is a table cell, add a br without 'data-mce-bogus' attribute.
      dom.add(parentBlock, dom.create('br', isCell ? {} : { 'data-mce-bogus': '1' }));
    }
  }

  selection.setRng(rng);
};

const deleteSelectedContent = (editor: Editor): void => {
  const dom = editor.dom;
  // Fix for #2595 seems that delete removes one extra character on
  // WebKit for some odd reason if you double click select a word
  const rng = RangeNormalizer.normalize(editor.selection.getRng());
  editor.selection.setRng(rng);
  // TINY-1044: Selecting all content in a single table cell will cause the entire table to be deleted
  // when using the native delete command. As such we need to manually delete the cell content instead
  const startCell = dom.getParent(rng.startContainer, isTableCell);
  if (isTableCellContentSelected(dom, rng, startCell)) {
    TableDelete.deleteCellContents(editor, rng, SugarElement.fromDom(startCell as HTMLTableCellElement));
  // TINY-9193: If the selection is over the whole text node in an element then Firefox incorrectly moves the caret to the previous line
  // TINY-11953: If the selection is over the whole anchor node, then Chrome incorrectly removes parent node alongside with it's child - anchor
  } else if (SelectionUtils.isSelectionOverWholeAnchor(rng) || SelectionUtils.isSelectionOverWholeTextNode(rng)) {
    rng.deleteContents();
  } else {
    editor.getDoc().execCommand('Delete', false);
  }
};

const findMarkerNode = (scope: AstNode): Optional<AstNode> => {
  for (let markerNode: AstNode | null | undefined = scope; markerNode; markerNode = markerNode.walk()) {
    if (markerNode.attr('id') === 'mce_marker') {
      return Optional.some(markerNode);
    }
  }

  return Optional.none();
};

const notHeadingsInSummary = (dom: DOMUtils, node: Element, fragment: AstNode) => {
  return Arr.exists(fragment.children(), AstNodeType.isHeading) && dom.getParent(node, dom.isBlock)?.nodeName === 'SUMMARY';
};

export const insertHtmlAtCaret = (editor: Editor, value: string, details: InsertContentDetails): string => {
  const selection = editor.selection;
  const dom = editor.dom;

  // Setup parser and serializer
  const parser = editor.parser;
  const merge = details.merge;

  const serializer = HtmlSerializer({
    validate: true
  }, editor.schema);
  const bookmarkHtml = '<span id="mce_marker" data-mce-type="bookmark">&#xFEFF;</span>';

  // TINY-10305: Remove all user-input zwsp to avoid impacting caret removal from content.
  if (!details.preserve_zwsp) {
    value = Zwsp.trim(value);
  }

  // Add caret at end of contents if it's missing
  if (value.indexOf('{$caret}') === -1) {
    value += '{$caret}';
  }

  // Replace the caret marker with a span bookmark element
  value = value.replace(/\{\$caret\}/, bookmarkHtml);

  // If selection is at <body>|<p></p> then move it into <body><p>|</p>
  let rng: Range | null = selection.getRng();
  const caretElement = rng.startContainer;
  const body = editor.getBody();
  if (caretElement === body && selection.isCollapsed()) {
    if (dom.isBlock(body.firstChild) && canHaveChildren(editor, body.firstChild) && dom.isEmpty(body.firstChild)) {
      rng = dom.createRng();
      rng.setStart(body.firstChild, 0);
      rng.setEnd(body.firstChild, 0);
      selection.setRng(rng);
    }
  }

  // Insert node maker where we will insert the new HTML and get it's parent
  if (!selection.isCollapsed()) {
    deleteSelectedContent(editor);
  }

  const parentNode = selection.getNode();

  // Parse the fragment within the context of the parent node
  const parserArgs: ParserArgs = { context: parentNode.nodeName.toLowerCase(), data: details.data, insert: true };
  const fragment = parser.parse(value, parserArgs);

  // Custom handling of lists
  if (details.paste === true && InsertList.isListFragment(editor.schema, fragment) && InsertList.isParentBlockLi(dom, parentNode)) {
    rng = InsertList.insertAtCaret(serializer, dom, selection.getRng(), fragment);
    if (rng) {
      selection.setRng(rng);
    }
    return value;
  }

  if (details.paste === true && shouldPasteContentOnly(dom, fragment, parentNode, editor.getBody())) {
    fragment.firstChild?.unwrap();
  }

  markFragmentElements(fragment);

  // Move the caret to a more suitable location
  let node = fragment.lastChild;
  if (node && node.attr('id') === 'mce_marker') {
    const marker = node;

    for (node = node.prev; node; node = node.walk(true)) {
      if (node.name === 'table') {
        break;
      }
      if (node.type === 3 || !dom.isBlock(node.name)) {
        if (node.parent && editor.schema.isValidChild(node.parent.name, 'span')) {
          node.parent.insert(marker, node, node.name === 'br');
        }
        break;
      }
    }
  }

  editor._selectionOverrides.showBlockCaretContainer(parentNode);

  // If parser says valid we can insert the contents into that parent
  if (!parserArgs.invalid && !notHeadingsInSummary(dom, parentNode, fragment)) {
    value = serializer.serialize(fragment);
    validInsertion(editor, value, parentNode);
  } else {
    // If the fragment was invalid within that context then we need
    // to parse and process the parent it's inserted into

    // Insert bookmark node and get the parent
    SetSelectionContent.setContentInternal(editor, bookmarkHtml);
    let parentNode: Node | null = selection.getNode();
    let tempNode: Node | null;
    const rootNode = editor.getBody();

    // Opera will return the document node when selection is in root
    if (NodeType.isDocument(parentNode)) {
      parentNode = tempNode = rootNode;
    } else {
      tempNode = parentNode;
    }

    // Find the ancestor just before the root element
    while (tempNode && tempNode !== rootNode) {
      parentNode = tempNode;
      tempNode = tempNode.parentNode;
    }

    // Get the outer/inner HTML depending on if we are in the root and parser and serialize that
    value = parentNode === rootNode ? rootNode.innerHTML : dom.getOuterHTML(parentNode);
    const root = parser.parse(value);
    const markerNode = findMarkerNode(root);
    const editingHost = markerNode.bind(ParserUtils.findClosestEditingHost).getOr(root);
    markerNode.each((marker) => marker.replace(fragment));

    const fragmentNodes = ParserUtils.getAllDescendants(fragment);
    fragment.unwrap();
    const invalidChildren = Arr.filter(fragmentNodes, (node) => InvalidNodes.isInvalid(editor.schema, node));
    InvalidNodes.cleanInvalidNodes(invalidChildren, editor.schema, editingHost);
    FilterNode.filter(parser.getNodeFilters(), parser.getAttributeFilters(), root);
    value = serializer.serialize(root);

    // Set the inner/outer HTML depending on if we are in the root or not
    if (parentNode === rootNode) {
      dom.setHTML(rootNode, value);
    } else {
      dom.setOuterHTML(parentNode, value);
    }
  }

  reduceInlineTextElements(editor, merge);
  moveSelectionToMarker(editor, dom.get('mce_marker'));
  unmarkFragmentElements(editor.getBody());
  trimBrsFromTableCell(dom, selection.getStart(), editor.schema);
  TransparentElements.updateCaret(editor.schema, editor.getBody(), selection.getStart());

  return value;
};
