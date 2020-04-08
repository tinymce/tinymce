import { Document, Node as DomNode } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Attr, Compare, Css, Element, Insert, InsertAll, Node, PredicateFilter, PredicateFind, Remove, SelectorFilter, SelectorFind, Text, Traverse } from '@ephox/sugar';
import TagBoundaries from '../common/TagBoundaries';
import { Universe } from './Universe';

export default function (): Universe<Element, Document> {
  const clone = function (element: Element) {
    return Element.fromDom((element.dom() as DomNode).cloneNode(false));
  };

  const document = function (element: Element) {
    return (element.dom() as DomNode).ownerDocument;
  };

  const isBoundary = function (element: Element) {
    if (!Node.isElement(element)) {
      return false;
    }
    if (Node.name(element) === 'body') {
      return true;
    }
    return Arr.contains(TagBoundaries, Node.name(element));
  };

  const isEmptyTag = function (element: Element) {
    if (!Node.isElement(element)) {
      return false;
    }
    return Arr.contains([ 'br', 'img', 'hr', 'input' ], Node.name(element));
  };

  const isNonEditable = (element: Element) => Node.isElement(element) && Attr.get(element, 'contenteditable') === 'false';

  const comparePosition = function (element: Element, other: Element) {
    return (element.dom() as DomNode).compareDocumentPosition(other.dom() as DomNode);
  };

  const copyAttributesTo = function (source: Element, destination: Element) {
    const as = Attr.clone(source);
    Attr.setAll(destination, as);
  };

  return {
    up: Fun.constant({
      selector: SelectorFind.ancestor,
      closest: SelectorFind.closest,
      predicate: PredicateFind.ancestor,
      all: Traverse.parents
    }),
    down: Fun.constant({
      selector: SelectorFilter.descendants,
      predicate: PredicateFilter.descendants
    }),
    styles: Fun.constant({
      get: Css.get,
      getRaw: Css.getRaw,
      set: Css.set,
      remove: Css.remove
    }),
    attrs: Fun.constant({
      get: Attr.get,
      set: Attr.set,
      remove: Attr.remove,
      copyTo: copyAttributesTo
    }),
    insert: Fun.constant({
      before: Insert.before,
      after: Insert.after,
      afterAll: InsertAll.after,
      append: Insert.append,
      appendAll: InsertAll.append,
      prepend: Insert.prepend,
      wrap: Insert.wrap
    }),
    remove: Fun.constant({
      unwrap: Remove.unwrap,
      remove: Remove.remove
    }),
    create: Fun.constant({
      nu: Element.fromTag,
      clone,
      text: Element.fromText
    }),
    query: Fun.constant({
      comparePosition,
      prevSibling: Traverse.prevSibling,
      nextSibling: Traverse.nextSibling
    }),
    property: Fun.constant({
      children: Traverse.children,
      name: Node.name,
      parent: Traverse.parent,
      document,
      isText: Node.isText,
      isComment: Node.isComment,
      isElement: Node.isElement,
      getText: Text.get,
      setText: Text.set,
      isBoundary,
      isEmptyTag,
      isNonEditable
    }),
    eq: Compare.eq,
    is: Compare.is
  };
}
