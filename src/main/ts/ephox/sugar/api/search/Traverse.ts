import { Type } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Struct } from '@ephox/katamari';
import Recurse from '../../alien/Recurse';
import Compare from '../dom/Compare';
import Element from '../node/Element';
import { Node as DomNode, HTMLElement as DomElement } from '@ephox/dom-globals';

// The document associated with the current element
var owner = function (element: Element) {
  return Element.fromDom((element.dom() as DomNode).ownerDocument);
};

var documentElement = function (element: Element) {
  return Element.fromDom((element.dom() as DomNode).ownerDocument.documentElement);
};

// The window element associated with the element
var defaultView = function (element: Element) {
  var el: DomNode = element.dom();
  var defaultView = el.ownerDocument.defaultView;
  return Element.fromDom(defaultView);
};

var parent = function (element: Element) {
  var dom: DomNode = element.dom();
  return Option.from(dom.parentNode).map(Element.fromDom);
};

var findIndex = function (element: Element) {
  return parent(element).bind(function (p: Element) {
    // TODO: Refactor out children so we can avoid the constant unwrapping
    var kin = children(p);
    return Arr.findIndex(kin, function (elem) {
      return Compare.eq(element, elem);
    });
  });
};

var parents = function (element: Element, isRoot) {
  var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

  // This is used a *lot* so it needs to be performant, not recursive
  var dom: DomNode = element.dom();
  var ret: Element[] = [];

  while (dom.parentNode !== null && dom.parentNode !== undefined) {
    var rawParent = dom.parentNode;
    var parent = Element.fromDom(rawParent);
    ret.push(parent);

    if (stop(parent) === true) break;
    else dom = rawParent;
  }
  return ret;
};

var siblings = function (element: Element) {
  // TODO: Refactor out children so we can just not add self instead of filtering afterwards
  var filterSelf = function (elements: Element[]) {
    return Arr.filter(elements, function (x) {
      return !Compare.eq(element, x);
    });
  };

  return parent(element).map(children).map(filterSelf).getOr([]);
};

var offsetParent = function (element: Element) {
  var dom: DomElement = element.dom();
  return Option.from(dom.offsetParent).map(Element.fromDom);
};

var prevSibling = function (element: Element) {
  var dom: DomNode = element.dom();
  return Option.from(dom.previousSibling).map(Element.fromDom);
};

var nextSibling = function (element: Element) {
  var dom: DomNode = element.dom();
  return Option.from(dom.nextSibling).map(Element.fromDom);
};

var prevSiblings = function (element: Element) {
  // This one needs to be reversed, so they're still in DOM order
  return Arr.reverse(Recurse.toArray(element, prevSibling));
};

var nextSiblings = function (element: Element) {
  return Recurse.toArray(element, nextSibling);
};

var children = function (element: Element) {
  // TypeScript doesn't like specifying the type here, because childNodes is not a real array
  var dom = element.dom();
  return Arr.map(dom.childNodes, Element.fromDom);
};

var child = function (element: Element, index: number) {
  var children = (element.dom() as DomNode).childNodes;
  return Option.from(children[index]).map(Element.fromDom);
};

var firstChild = function (element: Element) {
  return child(element, 0);
};

var lastChild = function (element: Element) {
  return child(element, (element.dom() as DomNode).childNodes.length - 1);
};

var childNodesCount = function (element: Element) {
  return (element.dom() as DomNode).childNodes.length;
};

var hasChildNodes = function (element: Element) {
  return (element.dom() as DomNode).hasChildNodes();
};

var spot = Struct.immutable('element', 'offset');
var leaf = function (element: Element, offset: number) {
  var cs = children(element);
  return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
};

export default {
  owner,
  defaultView,
  documentElement,
  parent,
  findIndex,
  parents,
  siblings,
  prevSibling,
  offsetParent,
  prevSiblings,
  nextSibling,
  nextSiblings,
  children,
  child,
  firstChild,
  lastChild,
  childNodesCount,
  hasChildNodes,
  leaf,
};