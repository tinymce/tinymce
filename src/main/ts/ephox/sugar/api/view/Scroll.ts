import { Option } from '@ephox/katamari';
import { Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Insert from '../dom/Insert';
import Remove from '../dom/Remove';
import Body from '../node/Body';
import Element from '../node/Element';
import Location from './Location';
import Position from './Position';
import { document } from '@ephox/dom-globals';

var isSafari = PlatformDetection.detect().browser.isSafari();

// get scroll position (x,y) relative to document _doc (or global if not supplied)
var get = function (_doc) {
  var doc = _doc !== undefined ? _doc.dom() : document;

  // ASSUMPTION: This is for cross-browser support, body works for Safari & EDGE, and when we have an iframe body scroller
  var x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
  var y = doc.body.scrollTop || doc.documentElement.scrollTop;
  return Position(x, y);
};

// Scroll content to (x,y) relative to document _doc (or global if not supplied)
var to = function (x, y, _doc) {
  var doc = _doc !== undefined ? _doc.dom() : document;
  var win = doc.defaultView;
  win.scrollTo(x, y);
};

// Scroll content by (x,y) relative to document _doc (or global if not supplied)
var by = function (x, y, _doc) {
  var doc = _doc !== undefined ? _doc.dom() : document;
  var win = doc.defaultView;
  win.scrollBy(x, y);
};

// Set the window scroll position to the element
var setToElement = function (win, element) {
  var pos = Location.absolute(element);
  var doc = Element.fromDom(win.document);
  to(pos.left(), pos.top(), doc);
};

// call f() preserving the original scroll position relative to document doc
var preserve = function (doc, f) {
  var before = get(doc);
  f();
  var after = get(doc);
  if (before.top() !== after.top() || before.left() !== after.left()) {
    to(before.left(), before.top(), doc);
  }
};

// capture the current scroll location and provide save and restore methods
var capture = function (doc) {
  var previous = Option.none();

  var save = function () {
    previous = Option.some(get(doc));
  };

  // TODO: this is quite similar to the code in nomad.
  var restore = function () {
    previous.each(function (p) {
      to(p.left(), p.top(), doc);
    });
  };

  save();
  return {
    save: save,      /* Saves the current page scroll position */
    restore: restore /* Restores the page scroll to its former position when invoked */
  };
};

// TBIO-4472 Safari 10 - Scrolling typeahead with keyboard scrolls page
var intoView = function (element, alignToTop) {
  if (isSafari && Type.isFunction(element.dom().scrollIntoViewIfNeeded)) {
    element.dom().scrollIntoViewIfNeeded(false); // false=align to nearest edge
  } else {
    element.dom().scrollIntoView(alignToTop); // true=to top, false=to bottom
  }
};

// If the element is above the container, or below the container, then scroll to the top or bottom
var intoViewIfNeeded = function (element, container) {
  var containerBox = container.dom().getBoundingClientRect();
  var elementBox = element.dom().getBoundingClientRect();
  if (elementBox.top < containerBox.top) {
    // element top is above the viewport top, scroll so it's at the top
    intoView(element, true);
  } else if (elementBox.bottom > containerBox.bottom) {
    // element bottom is below the viewport bottom, scroll so it's at the bottom
    intoView(element, false);
  }
};

// Return the scroll bar width (calculated by temporarily inserting an element into the dom)
var scrollBarWidth = function () {
  // From https://davidwalsh.name/detect-scrollbar-width
  var scrollDiv = Element.fromHtml('<div style="width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;"></div>');
  Insert.after(Body.body(), scrollDiv);
  var w = scrollDiv.dom().offsetWidth - scrollDiv.dom().clientWidth;
  Remove.remove(scrollDiv);
  return w;
};

export default <any> {
  get: get,
  to: to,
  by: by,
  preserve: preserve,
  capture: capture,
  intoView: intoView,
  intoViewIfNeeded: intoViewIfNeeded,
  setToElement: setToElement,
  scrollBarWidth: scrollBarWidth
};