import { Arr } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Element from '../node/Element';
import NodeTypes from '../node/NodeTypes';
import { document } from '@ephox/dom-globals';

var ELEMENT = NodeTypes.ELEMENT;
var DOCUMENT = NodeTypes.DOCUMENT;

var is = function (element, selector) {
  var elem = element.dom();
  if (elem.nodeType !== ELEMENT) return false; // documents have querySelector but not matches

  // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
  // Still check for the others, but do it last.
  else if (elem.matches !== undefined) return elem.matches(selector);
  else if (elem.msMatchesSelector !== undefined) return elem.msMatchesSelector(selector);
  else if (elem.webkitMatchesSelector !== undefined) return elem.webkitMatchesSelector(selector);
  else if (elem.mozMatchesSelector !== undefined) return elem.mozMatchesSelector(selector);
  else throw new Error('Browser lacks native selectors'); // unfortunately we can't throw this on startup :(
};

var bypassSelector = function (dom) {
  // Only elements and documents support querySelector
  return dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT ||
          // IE fix for complex queries on empty nodes: http://jsfiddle.net/spyder/fv9ptr5L/
          dom.childElementCount === 0;
};

var all = function (selector, scope) {
  var base = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? [] : Arr.map(base.querySelectorAll(selector), Element.fromDom);
};

var one = function (selector, scope) {
  var base = scope === undefined ? document : scope.dom();
  return bypassSelector(base) ? Option.none() : Option.from(base.querySelector(selector)).map(Element.fromDom);
};

export default <any> {
  all: all,
  is: is,
  one: one
};