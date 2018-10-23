import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
// TS reports this as unused but it's needed for cleaner JS
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import * as Compare from '../dom/Compare';
import * as PredicateFind from './PredicateFind';
import * as SelectorFilter from './SelectorFilter';
import * as SelectorFind from './SelectorFind';
import * as Traverse from './Traverse';
import Element from '../node/Element';

var inAncestor = Struct.immutable('ancestor', 'descendants', 'element', 'index');
var inParent = Struct.immutable('parent', 'children', 'element', 'index');

var childOf = function (element: Element, ancestor: Element) {
  return PredicateFind.closest(element, function (elem) {
    return Traverse.parent(elem).exists(function (parent) {
      return Compare.eq(parent, ancestor);
    });
  });
};

var indexInParent = function (element: Element) {
  return Traverse.parent(element).bind(function (parent) {
    var children = Traverse.children(parent);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

var indexOf = function (elements: Element[], element: Element) {
  return Arr.findIndex(elements, Fun.curry(Compare.eq, element));
};

var selectorsInParent = function (element: Element, selector: string) {
  return Traverse.parent(element).bind(function (parent) {
    var children = SelectorFilter.children(parent, selector);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

var descendantsInAncestor = function (element: Element, ancestorSelector: string, descendantSelector: string) {
  return SelectorFind.closest(element, ancestorSelector).bind(function (ancestor) {
    var descendants = SelectorFilter.descendants(ancestor, descendantSelector);
    return indexOf(descendants, element).map(function (index) {
      return inAncestor(ancestor, descendants, element, index);
    });
  });
};

export {
  childOf,
  indexOf,
  indexInParent,
  selectorsInParent,
  descendantsInAncestor,
};