import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import Sizzle from '@ephox/wrap-sizzle';

var toOptionEl = function (output) {
  return output.length === 0 ? Option.none() : Option.from(output[0]).map(Element.fromDom);
};

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
var descendant = function (sugarElement, selector) {
  var siz = Sizzle(selector, sugarElement.dom());
  return toOptionEl(siz);
};

var toArrayEl = function (elements) {
  return Arr.map(elements, Element.fromDom);
}

/* Petrie makes extensive use of :visible, :has() and :contains() which are sizzle extensions */
var descendants = function (sugarElement, selector) {
  return toArrayEl(Sizzle(selector, sugarElement.dom()));
};

var matches = function (sugarElement, selector) {
  return Sizzle.matchesSelector(sugarElement.dom(), selector);
};

var child = function (sugarElement, selector) {
  var children = Traverse.children(sugarElement);
  return Arr.find(children, function (child) {
    return matches(child, selector);
  });
};

var children = function (sugarElement, selector) {
  var children = Traverse.children(sugarElement);
  return Arr.filter(children, function (child) {
    return matches(child, selector);
  });
};

export default <any> {
  descendant: descendant,
  descendants: descendants,
  matches: matches,
  child: child,
  children: children
};