import { Fun, Obj, Type } from '@ephox/katamari';
import { Compare, ContentEditable, SugarNode, SugarElement, Traverse, PredicateExists } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Schema from '../api/html/Schema';
import { isWhitespaceText, isZwsp } from '../text/Whitespace';
import * as NodeType from './NodeType';

interface IsEmptyOptions {
  readonly skipBogus?: boolean;
  readonly includeZwsp?: boolean;
  readonly checkRootAsContent?: boolean;
  readonly isContent?: (node: Node) => boolean;
}

type IsContentOptions = Pick<IsEmptyOptions, 'includeZwsp' | 'isContent'>;

const defaultOptionValues: IsEmptyOptions = {
  skipBogus: true,
  includeZwsp: false,
  checkRootAsContent: false,
};

const hasWhitespacePreserveParent = (node: Node, rootNode: Node, schema: Schema): boolean => {
  const rootElement = SugarElement.fromDom(rootNode);
  const startNode = SugarElement.fromDom(node);
  const whitespaceElements = schema.getWhitespaceElements();
  const predicate = (node: SugarElement<Node>) => Obj.has(whitespaceElements, SugarNode.name(node));
  return PredicateExists.ancestor(startNode, predicate, Fun.curry(Compare.eq, rootElement));
};

const isNamedAnchor = (node: Node): boolean => {
  return NodeType.isElement(node) && node.nodeName === 'A' && !node.hasAttribute('href') && (node.hasAttribute('name') || node.hasAttribute('id'));
};

const isNonEmptyElement = (node: Node, schema: Schema): boolean => {
  return NodeType.isElement(node) && Obj.has(schema.getNonEmptyElements(), node.nodeName);
};

const isBookmark = NodeType.hasAttribute('data-mce-bookmark');

const hasNonEditableParent = (node: Node) =>
  Traverse.parentElement(SugarElement.fromDom(node)).exists((parent) => !ContentEditable.isEditable(parent));

const isWhitespace = (node: Text, rootNode: Node, schema: Schema): boolean =>
  isWhitespaceText(node.data)
  && !hasWhitespacePreserveParent(node, rootNode, schema);

const isText = (node: Node, rootNode: Node, schema: Schema, options: IsEmptyOptions) =>
  NodeType.isText(node)
  && !isWhitespace(node, rootNode, schema)
  && (!options.includeZwsp || !isZwsp(node.data));

const isContentNode = (schema: Schema, node: Node, rootNode: Node, options: IsContentOptions): boolean => {
  return Type.isFunction(options.isContent) && options.isContent(node)
  || isNonEmptyElement(node, schema)
  || isBookmark(node)
  || isNamedAnchor(node)
  || isText(node, rootNode, schema, options)
  || NodeType.isContentEditableFalse(node)
  || NodeType.isContentEditableTrue(node) && hasNonEditableParent(node);
};

const isEmptyNode = (schema: Schema, targetNode: Node, opts?: IsEmptyOptions): boolean => {
  const options = { ...defaultOptionValues, ...opts };
  if (options.checkRootAsContent) {
    if (isContentNode(schema, targetNode, targetNode, options)) {
      return false;
    }
  }

  let node: Node | null | undefined = targetNode.firstChild;
  let brCount = 0;
  if (!node) {
    return true;
  }

  const walker = new DomTreeWalker(node, targetNode);
  do {
    if (options.skipBogus && NodeType.isElement(node)) {
      const bogusValue = node.getAttribute('data-mce-bogus');
      if (bogusValue) {
        node = walker.next(bogusValue === 'all');
        continue;
      }
    }

    if (NodeType.isComment(node) ) {
      node = walker.next(true);
      continue;
    }

    if (NodeType.isBr(node)) {
      brCount++;
      node = walker.next();
      continue;
    }

    if (isContentNode(schema, node, targetNode, options)) {
      return false;
    }

    node = walker.next();
  } while (node);

  return brCount <= 1;
};

const isEmpty = (schema: Schema, elm: SugarElement<Node>, options?: IsEmptyOptions): boolean => {
  return isEmptyNode(schema, elm.dom, { checkRootAsContent: true, ...options });
};

const isContent = (schema: Schema, node: Node, options?: IsContentOptions): boolean => {
  return isContentNode(schema, node, node, { includeZwsp: defaultOptionValues.includeZwsp, ...options });
};

export {
  IsEmptyOptions,
  isEmpty,
  isEmptyNode,
  isContent
};
