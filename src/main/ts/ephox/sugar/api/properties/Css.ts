import { Type } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import Attr from './Attr';
import Body from '../node/Body';
import Element from '../node/Element';
import Node from '../node/Node';
import Style from '../../impl/Style';
import { Strings } from '@ephox/katamari';
import { console, window } from '@ephox/dom-globals';

var internalSet = function (dom, property, value) {
  // This is going to hurt. Apologies.
  // JQuery coerces numbers to pixels for certain property names, and other times lets numbers through.
  // we're going to be explicit; strings only.
  if (!Type.isString(value)) {
    console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
    throw new Error('CSS value must be a string: ' + value);
  }

  // removed: support for dom().style[property] where prop is camel case instead of normal property name
  if (Style.isSupported(dom)) dom.style.setProperty(property, value);
};

var internalRemove = function (dom, property) {
  /*
   * IE9 and above - MDN doesn't have details, but here's a couple of random internet claims
   *
   * http://help.dottoro.com/ljopsjck.php
   * http://stackoverflow.com/a/7901886/7546
   */
  if (Style.isSupported(dom)) dom.style.removeProperty(property);
};

var set = function (element, property, value) {
  var dom = element.dom();
  internalSet(dom, property, value);
};

var setAll = function (element, css) {
  var dom = element.dom();

  Obj.each(css, function (v, k) {
    internalSet(dom, k, v);
  });
};

var setOptions = function(element, css) {
  var dom = element.dom();

  Obj.each(css, function (v, k) {
    v.fold(function () {
      internalRemove(dom, k);
    }, function (value) {
      internalSet(dom, k, value);
    });
  });
};

/*
 * NOTE: For certain properties, this returns the "used value" which is subtly different to the "computed value" (despite calling getComputedStyle).
 * Blame CSS 2.0.
 *
 * https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 */
var get = function (element, property) {
  var dom = element.dom();
  /*
   * IE9 and above per
   * https://developer.mozilla.org/en/docs/Web/API/window.getComputedStyle
   *
   * Not in numerosity, because it doesn't memoize and looking this up dynamically in performance critical code would be horrendous.
   *
   * JQuery has some magic here for IE popups, but we don't really need that.
   * It also uses element.ownerDocument.defaultView to handle iframes but that hasn't been required since FF 3.6.
   */
  var styles = window.getComputedStyle(dom);
  var r = styles.getPropertyValue(property);

  // jquery-ism: If r is an empty string, check that the element is not in a document. If it isn't, return the raw value.
  // Turns out we do this a lot.
  var v = (r === '' && !Body.inBody(element)) ? getUnsafeProperty(dom, property) : r;

  // undefined is the more appropriate value for JS. JQuery coerces to an empty string, but screw that!
  return v === null ? undefined : v;
};

var getUnsafeProperty = function (dom, property) {
  // removed: support for dom().style[property] where prop is camel case instead of normal property name
  // empty string is what the browsers (IE11 and Chrome) return when the propertyValue doesn't exists.
  return Style.isSupported(dom) ? dom.style.getPropertyValue(property) : '';
};

/*
 * Gets the raw value from the style attribute. Useful for retrieving "used values" from the DOM:
 * https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
 *
 * Returns NONE if the property isn't set, or the value is an empty string.
 */
var getRaw = function (element, property) {
  var dom = element.dom();
  var raw = getUnsafeProperty(dom, property);

  return Option.from(raw).filter(function (r) { return r.length > 0; });
};

var getAllRaw = function (element) {
  var css = {};
  var dom = element.dom();

  if (Style.isSupported(dom)) {
    for (var i = 0; i < dom.style.length; i++) {
      var ruleName = dom.style.item(i);
      css[ruleName] = dom.style[ruleName];
    }
  }
  return css;
};

var isValidValue = function (tag, property, value) {
  var element = Element.fromTag(tag);
  set(element, property, value);
  var style = getRaw(element, property);
  return style.isSome();
};

var remove = function (element, property) {
  var dom = element.dom();

  internalRemove(dom, property);

  if (Attr.has(element, 'style') && Strings.trim(Attr.get(element, 'style')) === '') {
    // No more styles left, remove the style attribute as well
    Attr.remove(element, 'style');
  }
};

var preserve = function (element, f) {
  var oldStyles = Attr.get(element, 'style');
  var result = f(element);
  var restore = oldStyles === undefined ? Attr.remove : Attr.set;
  restore(element, 'style', oldStyles);
  return result;
};

var copy = function (source, target) {
  var sourceDom = source.dom();
  var targetDom = target.dom();
  if (Style.isSupported(sourceDom) && Style.isSupported(targetDom)) {
    targetDom.style.cssText = sourceDom.style.cssText;
  }
};

var reflow = function (e) {
  /* NOTE:
   * do not rely on this return value.
   * It's here so the closure compiler doesn't optimise the property access away.
   */
  return e.dom().offsetWidth;
};

var transferOne = function (source, destination, style) {
  getRaw(source, style).each(function (value) {
    // NOTE: We don't want to clobber any existing inline styles.
    if (getRaw(destination, style).isNone()) set(destination, style, value);
  });
};

var transfer = function (source, destination, styles) {
  if (!Node.isElement(source) || !Node.isElement(destination)) return;
  Arr.each(styles, function (style) {
    transferOne(source, destination, style);
  });
};

export default <any> {
  copy: copy,
  set: set,
  preserve: preserve,
  setAll: setAll,
  setOptions: setOptions,
  remove: remove,
  get: get,
  getRaw: getRaw,
  getAllRaw: getAllRaw,
  isValidValue: isValidValue,
  reflow: reflow,
  transfer: transfer
};