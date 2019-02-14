import TagBoundaries from '../common/TagBoundaries';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Compare } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { InsertAll } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import { PredicateFilter } from '@ephox/sugar';
import { PredicateFind } from '@ephox/sugar';
import { Remove } from '@ephox/sugar';
import { SelectorFilter } from '@ephox/sugar';
import { SelectorFind } from '@ephox/sugar';
import { Text } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import { Universe } from './Universe';
import { Document, Node as DomNode } from '@ephox/dom-globals';



export default function (): Universe<Element, Document> {
  var clone = function (element) {
    return Element.fromDom(element.dom().cloneNode(false));
  };

  var document = function (element: Element) {
    return (element.dom() as DomNode).ownerDocument;
  }

  var isBoundary = function (element) {
    if (!Node.isElement(element)) return false;
    if (Node.name(element) === 'body') return true;
    return Arr.contains(TagBoundaries, Node.name(element));
  };

  var isEmptyTag = function (element) {
    if (!Node.isElement(element)) return false;
    return Arr.contains(['br', 'img', 'hr', 'input'], Node.name(element));
  };

  var comparePosition = function (element, other) {
    return element.dom().compareDocumentPosition(other.dom());
  };

  var copyAttributesTo = function (source, destination) {
    var as = Attr.clone(source);
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
      clone: clone,
      text: Element.fromText
    }),
    query: Fun.constant({
      comparePosition: comparePosition,
      prevSibling: Traverse.prevSibling,
      nextSibling: Traverse.nextSibling
    }),
    property: Fun.constant({
      children: Traverse.children,
      name: Node.name,
      parent: Traverse.parent,
      document: document,
      isText: Node.isText,
      isComment: Node.isComment,
      isElement: Node.isElement,
      getText: Text.get,
      setText: Text.set,
      isBoundary: isBoundary,
      isEmptyTag: isEmptyTag
    }),
    eq: Compare.eq,
    is: Compare.is
  };
};