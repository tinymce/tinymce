import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import Compare from '../dom/Compare';
import PredicateFind from './PredicateFind';
import SelectorFilter from './SelectorFilter';
import SelectorFind from './SelectorFind';
import Traverse from './Traverse';

var inAncestor = Struct.immutable('ancestor', 'descendants', 'element', 'index');
var inParent = Struct.immutable('parent', 'children', 'element', 'index');

var childOf = function (element, ancestor) {
  return PredicateFind.closest(element, function (elem) {
    return Traverse.parent(elem).exists(function (parent) {
      return Compare.eq(parent, ancestor);
    });
  });
};

var indexInParent = function (element) {
  return Traverse.parent(element).bind(function (parent) {
    var children = Traverse.children(parent);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

var indexOf = function (elements, element) {
  return Arr.findIndex(elements, Fun.curry(Compare.eq, element));
};

var selectorsInParent = function (element, selector) {
  return Traverse.parent(element).bind(function (parent) {
    var children = SelectorFilter.children(parent, selector);
    return indexOf(children, element).map(function (index) {
      return inParent(parent, children, element, index);
    });
  });
};

var descendantsInAncestor = function (element, ancestorSelector, descendantSelector) {
  return SelectorFind.closest(element, ancestorSelector).bind(function (ancestor) {
    var descendants = SelectorFilter.descendants(ancestor, descendantSelector);
    return indexOf(descendants, element).map(function (index) {
      return inAncestor(ancestor, descendants, element, index);
    });
  });
};

export default <any> {
  childOf: childOf,
  indexOf: indexOf,
  indexInParent: indexInParent,
  selectorsInParent: selectorsInParent,
  descendantsInAncestor: descendantsInAncestor
};