import { Fun, Obj, Type } from '@ephox/katamari';
import { Compare, ContentEditable, SugarNode, SugarElement, Traverse, PredicateExists } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Schema from '../api/html/Schema';
import { isWhitespaceText, isZwsp } from '../text/Whitespace';
import * as NodeType from './NodeType';

interface AdjustOptions {
  skipBogus?: boolean;
  includeZwsp?: boolean;
  check_root_as_content?: boolean;
  isContent?: (node: Node) => boolean;
}

const defaultOptionValues: AdjustOptions = {
  skipBogus: true,
  includeZwsp: false,
  check_root_as_content: false,
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

const isText = (node: Node, rootNode: Node, schema: Schema, options: AdjustOptions) =>
  NodeType.isText(node)
  && !isWhitespace(node, rootNode, schema)
  && (!options.includeZwsp || !isZwsp(node.data));

const isContent = (schema: Schema, node: Node, rootNode: Node, options?: AdjustOptions): boolean => {
  options = { ...defaultOptionValues, ...options };
  return Type.isFunction(options.isContent) && options.isContent(node)
  || isNonEmptyElement(node, schema)
  || isBookmark(node)
  || isNamedAnchor(node)
  || isText(node, rootNode, schema, options)
  || NodeType.isContentEditableFalse(node)
  || NodeType.isContentEditableTrue(node) && hasNonEditableParent(node);
};

const isEmptyNode = (schema: Schema, targetNode: Node, options?: AdjustOptions): boolean => {
  options = { ...defaultOptionValues, ...options };
  if (options.check_root_as_content) {
    if (isContent(schema, targetNode, targetNode, options)) {
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
    if (options.skipBogus && NodeType.isBogusAll(node)) {
      node = walker.next(true);
      continue;
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

    if (isContent(schema, node, targetNode, options)) {
      return false;
    }

    node = walker.next();
  } while (node);

  return brCount <= 1;
};

const isEmpty = (schema: Schema, elm: SugarElement<Node>, options?: AdjustOptions): boolean => {
  return isEmptyNode(schema, elm.dom, { check_root_as_content: true, ...options });
};

export {
  AdjustOptions,
  isEmpty,
  isEmptyNode,
  isContent
};
