import { Arr, Optional, Optionals, Strings, Type, Unicode } from '@ephox/katamari';
import { Css, Html, PredicateFind, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Schema from '../api/html/Schema';
import { isAfterBlock, isAtEndOfBlock, isAtStartOfBlock, isBeforeBlock } from '../caret/BlockBoundary';
import { isAfterBr, isBeforeBr } from '../caret/CaretBr';
import * as CaretFinder from '../caret/CaretFinder';
import { CaretPosition } from '../caret/CaretPosition';
import { isAfterSpace, isBeforeSpace } from '../caret/CaretPositionPredicates';
import { getElementFromPosition, isBlockLike } from '../caret/CaretUtils';
import * as NodeType from '../dom/NodeType';
import * as Parents from '../dom/Parents';
import { isContent, isNbsp, isWhiteSpace } from '../text/CharType';

const isInMiddleOfText = (pos: CaretPosition) => CaretPosition.isTextPosition(pos) && !pos.isAtStart() && !pos.isAtEnd();

const getClosestBlock = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): SugarElement<Node> => {
  const parentBlocks = Arr.filter(Parents.parentsAndSelf(SugarElement.fromDom(pos.container()), root), (el) => schema.isBlock(SugarNode.name(el)));
  return Arr.head(parentBlocks).getOr(root);
};

const hasSpaceBefore = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInMiddleOfText(pos)) {
    return isAfterSpace(pos);
  } else {
    return isAfterSpace(pos) || CaretFinder.prevPosition(getClosestBlock(root, pos, schema).dom, pos).exists(isAfterSpace);
  }
};

const hasSpaceAfter = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInMiddleOfText(pos)) {
    return isBeforeSpace(pos);
  } else {
    return isBeforeSpace(pos) || CaretFinder.nextPosition(getClosestBlock(root, pos, schema).dom, pos).exists(isBeforeSpace);
  }
};

const isPreValue = (value: string) => Arr.contains([ 'pre', 'pre-wrap' ], value);

const isInPre = (pos: CaretPosition) => getElementFromPosition(pos)
  .bind((elm) => PredicateFind.closest(elm, SugarNode.isElement))
  .exists((elm) => isPreValue(Css.get(elm, 'white-space')));

const isAtBeginningOfBody = (root: SugarElement<Node>, pos: CaretPosition) => CaretFinder.prevPosition(root.dom, pos).isNone();
const isAtEndOfBody = (root: SugarElement<Node>, pos: CaretPosition) => CaretFinder.nextPosition(root.dom, pos).isNone();

const isAtLineBoundary = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => (
  isAtBeginningOfBody(root, pos) ||
    isAtEndOfBody(root, pos) ||
    isAtStartOfBlock(root, pos, schema) ||
    isAtEndOfBlock(root, pos, schema) ||
    isAfterBr(root, pos, schema) ||
    isBeforeBr(root, pos, schema)
);

const isCefBlock = (node: Node | null | undefined): node is HTMLElement =>
  Type.isNonNullable(node) && NodeType.isContentEditableFalse(node) && isBlockLike(node);

// Check the next/previous element in case it is a cef and the next/previous caret position then would skip it, then check
// the next next/previous caret position ( for example in case the next element is a strong, containing a cef ).
const isSiblingCefBlock = (root: Element, direction: 'next' | 'prev') => (container: Node) => {
  return isCefBlock(new DomTreeWalker(container, root)[direction]());
};

const isBeforeCefBlock = (root: SugarElement, pos: CaretPosition) => {
  const nextPos = CaretFinder.nextPosition(root.dom, pos).getOr(pos);
  const isNextCefBlock = isSiblingCefBlock(root.dom, 'next');
  return pos.isAtEnd() && (isNextCefBlock(pos.container()) || isNextCefBlock(nextPos.container()));
};

const isAfterCefBlock = (root: SugarElement, pos: CaretPosition) => {
  const prevPos = CaretFinder.prevPosition(root.dom, pos).getOr(pos);
  const isPrevCefBlock = isSiblingCefBlock(root.dom, 'prev');
  return pos.isAtStart() && (isPrevCefBlock(pos.container()) || isPrevCefBlock(prevPos.container()));
};

const needsToHaveNbsp = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtLineBoundary(root, pos, schema) || hasSpaceBefore(root, pos, schema) || hasSpaceAfter(root, pos, schema);
  }
};

const needsToBeNbspLeft = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtStartOfBlock(root, pos, schema) || isBeforeBlock(root, pos, schema) || isAfterBr(root, pos, schema) || hasSpaceBefore(root, pos, schema) || isAfterCefBlock(root, pos);
  }
};

const leanRight = (pos: CaretPosition): CaretPosition => {
  const container = pos.container();
  const offset = pos.offset();

  if (NodeType.isText(container) && offset < container.data.length) {
    return CaretPosition(container, offset + 1);
  } else {
    return pos;
  }
};

const needsToBeNbspRight = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean => {
  if (isInPre(pos)) {
    return false;
  } else {
    return isAtEndOfBlock(root, pos, schema) || isAfterBlock(root, pos, schema) || isBeforeBr(root, pos, schema) || hasSpaceAfter(root, pos, schema) || isBeforeCefBlock(root, pos);
  }
};

const needsToBeNbsp = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): boolean =>
  needsToBeNbspLeft(root, pos, schema) || needsToBeNbspRight(root, leanRight(pos), schema);

const isNbspAt = (text: string, offset: number): boolean =>
  isNbsp(text.charAt(offset));

const isWhiteSpaceAt = (text: string, offset: number): boolean =>
  isWhiteSpace(text.charAt(offset));

const hasNbsp = (pos: CaretPosition): boolean => {
  const container = pos.container();
  return NodeType.isText(container) && Strings.contains(container.data, Unicode.nbsp);
};

const normalizeNbspMiddle = (text: string): string => {
  // // eslint-disable-next-line no-console
  // console.log('normalizeNbspMiddle');
  const chars = text.split('');
  return Arr.map(chars, (chr, i) => {
    if (isNbsp(chr) && i > 0 && i < chars.length - 1 && isContent(chars[i - 1]) && isContent(chars[i + 1])) {
      return ' ';
    } else {
      return chr;
    }
  }).join('');
};

const normalizeNbspAtStart = (root: SugarElement<Node>, node: Text, makeNbsp: boolean, schema: Schema): boolean => {
  const text = node.data;
  const firstPos = CaretPosition(node, 0);

  if (!makeNbsp && isNbspAt(text, 0) && !needsToBeNbsp(root, firstPos, schema)) {
    node.data = ' ' + text.slice(1);
    return true;
  } else if (makeNbsp && isWhiteSpaceAt(text, 0) && needsToBeNbspLeft(root, firstPos, schema)) {
    node.data = Unicode.nbsp + text.slice(1);
    return true;
  } else {
    return false;
  }
};

const normalizeNbspInMiddleOfTextNode = (node: Text): boolean => {
  const text = node.data;
  const newText = normalizeNbspMiddle(text);
  if (newText !== text) {
    node.data = newText;
    return true;
  } else {
    return false;
  }
};

const normalizeNbspAtEnd = (root: SugarElement<Node>, node: Text, makeNbsp: boolean, schema: Schema): boolean => {
  const text = node.data;
  const lastPos = CaretPosition(node, text.length - 1);
  if (!makeNbsp && isNbspAt(text, text.length - 1) && !needsToBeNbsp(root, lastPos, schema)) {
    node.data = text.slice(0, -1) + ' ';
    return true;
  } else if (makeNbsp && isWhiteSpaceAt(text, text.length - 1) && needsToBeNbspRight(root, lastPos, schema)) {
    node.data = text.slice(0, -1) + Unicode.nbsp;
    return true;
  } else {
    return false;
  }
};

const normalizeNbsps = (root: SugarElement<Node>, pos: CaretPosition, schema: Schema): Optional<CaretPosition> => {
  const container = pos.container();
  // eslint-disable-next-line no-console
  console.log('container 2: ', container);
  if (!NodeType.isText(container)) {
    return Optional.none();
  }

  if (hasNbsp(pos)) {
    const normalized = normalizeNbspAtStart(root, container, false, schema) || normalizeNbspInMiddleOfTextNode(container) || normalizeNbspAtEnd(root, container, false, schema);
    return Optionals.someIf(normalized, pos);
  } else if (needsToBeNbsp(root, pos, schema)) {
    const normalized = normalizeNbspAtStart(root, container, true, schema) || normalizeNbspAtEnd(root, container, true, schema);
    return Optionals.someIf(normalized, pos);
  } else {
    return Optional.none();
  }
};

const normalizeNbspsInEditor = (editor: Editor): void => {
  const root = SugarElement.fromDom(editor.getBody());

  if (editor.selection.isCollapsed()) {
    normalizeNbsps(root, CaretPosition.fromRangeStart(editor.selection.getRng()), editor.schema).each((pos) => {
      editor.selection.setRng(pos.toRange());
    });
  }
};

const startsWithSpaceOrNbsp = (text: string) => /^(&nbsp;|\s)(.*?)/.test(text);
const endsWithSpaceOrNbsp = (text: string) => /(.*?)(&nbsp;|\s)$/.test(text);

const endsWithDoubleSpaceOrNbsp = (text: string) => /^(.*?)(&nbsp;|\s){2}$/.test(text);

const startsWithDoubleSpaceOrNbsp = (text: string) => /^(&nbsp;|\s){2}(.*?)$/.test(text);

const normalizeNbspWithElements = (content: string, schema: Schema): string => {
  const wrappedContent = document.createElement('div');
  wrappedContent.innerHTML = content;
  const itNeedWrapper = !wrappedContent.hasChildNodes() || wrappedContent.childNodes.length > 1;

  const node: SugarElement<HTMLElement> = itNeedWrapper ? SugarElement.fromHtml(`<span>${content}</span>`) : SugarElement.fromHtml(content);

  Arr.each(Traverse.children(node), (child) => {

    if (Traverse.nextSibling(child).exists((nextChild) =>
      SugarNode.isHTMLElement(nextChild)
      && schema.isInline(SugarNode.name(nextChild))
      && !startsWithSpaceOrNbsp(Html.get(nextChild))
    )) {

      if (SugarNode.isHTMLElement(child)) {
        if (endsWithDoubleSpaceOrNbsp(Html.get(child))) {
          return;
        }
        Html.set(child, Html.get(child).replace(/&nbsp;$/, ' '));
      }
      if (SugarNode.isText(child)) {
        if (endsWithDoubleSpaceOrNbsp(child.dom.nodeValue ?? '')) {
          return;
        }
        child.dom.nodeValue = child.dom.data.replace(new RegExp(`${Unicode.nbsp}$`, ''), ' ');
      }
    }

    if (Traverse.prevSibling(child).exists((prevChild) => {
      const isAnInlineElementThatNotEndsWithSpaceOrNbsp = SugarNode.isHTMLElement(prevChild)
        && schema.isInline(SugarNode.name(prevChild))
        && !endsWithSpaceOrNbsp(Html.get(prevChild));

      const isATextElementThatNotEndsWithSpaceOrNbsp = SugarNode.isText(prevChild)
        && !endsWithSpaceOrNbsp(prevChild.dom.nodeValue ?? '');

      return isAnInlineElementThatNotEndsWithSpaceOrNbsp || isATextElementThatNotEndsWithSpaceOrNbsp;
    })) {
      if (SugarNode.isHTMLElement(child)) {
        if (startsWithDoubleSpaceOrNbsp(Html.get(child))) {
          return;
        }
        Html.set(child, Html.get(child).replace(/^&nbsp;/, ' '));
      }
      if (SugarNode.isText(child)) {
        if (startsWithDoubleSpaceOrNbsp(child.dom.nodeValue ?? '')) {
          return;
        }
        child.dom.nodeValue = child.dom.data.replace(new RegExp(`^${Unicode.nbsp}`, ''), ' ');
      }
    }
  });

  return itNeedWrapper ? Html.get(node) : Html.getOuter(node);
};

export {
  needsToBeNbspLeft,
  needsToBeNbspRight,
  needsToBeNbsp,
  needsToHaveNbsp,
  normalizeNbspMiddle,
  normalizeNbspsInEditor,
  normalizeNbspWithElements
};
