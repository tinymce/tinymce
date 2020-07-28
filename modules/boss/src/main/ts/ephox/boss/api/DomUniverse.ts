import { Arr, Fun } from '@ephox/katamari';
import {
  Attribute, Compare, Css, Insert, InsertAll, PredicateFilter, PredicateFind, Remove, SelectorFilter, SelectorFind, SugarElement, SugarNode,
  SugarText, Traverse
} from '@ephox/sugar';
import TagBoundaries from '../common/TagBoundaries';
import { Universe } from './Universe';

export default function (): Universe<SugarElement, Document> {
  const clone = function (element: SugarElement<Node>) {
    return SugarElement.fromDom(element.dom.cloneNode(false));
  };

  const document = (element: SugarElement<Node>) => Traverse.documentOrOwner(element).dom;

  const isBoundary = function (element: SugarElement) {
    if (!SugarNode.isElement(element)) {
      return false;
    }
    if (SugarNode.name(element) === 'body') {
      return true;
    }
    return Arr.contains(TagBoundaries, SugarNode.name(element));
  };

  const isEmptyTag = function (element: SugarElement) {
    if (!SugarNode.isElement(element)) {
      return false;
    }
    return Arr.contains([ 'br', 'img', 'hr', 'input' ], SugarNode.name(element));
  };

  const isNonEditable = (element: SugarElement) => SugarNode.isElement(element) && Attribute.get(element, 'contenteditable') === 'false';

  const comparePosition = function (element: SugarElement<Node>, other: SugarElement<Node>) {
    return element.dom.compareDocumentPosition(other.dom);
  };

  const copyAttributesTo = function (source: SugarElement, destination: SugarElement) {
    const as = Attribute.clone(source);
    Attribute.setAll(destination, as);
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
      get: Attribute.get,
      set: Attribute.set,
      remove: Attribute.remove,
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
      nu: SugarElement.fromTag,
      clone,
      text: SugarElement.fromText
    }),
    query: Fun.constant({
      comparePosition,
      prevSibling: Traverse.prevSibling,
      nextSibling: Traverse.nextSibling
    }),
    property: Fun.constant({
      children: Traverse.children,
      name: SugarNode.name,
      parent: Traverse.parent,
      document,
      isText: SugarNode.isText,
      isComment: SugarNode.isComment,
      isElement: SugarNode.isElement,
      getText: SugarText.get,
      setText: SugarText.set,
      isBoundary,
      isEmptyTag,
      isNonEditable
    }),
    eq: Compare.eq,
    is: Compare.is
  };
}
