define(
  'ephox.sugar.api.search.Selectors',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.NodeTypes',
    'global!Error',
    'global!document'
  ],

  function (Arr, Option, Element, NodeTypes, Error, document) {
    /*
     * There's a lot of code here; the aim is to allow the browser to optimise constant comparisons,
     * instead of doing object lookup feature detection on every call
     */
    var STANDARD = 0;
    var MSSTANDARD = 1;
    var WEBKITSTANDARD = 2;
    var FIREFOXSTANDARD = 3;

    var selectorType = (function () {
      var test = document.createElement('span');
      // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
      // Still check for the others, but do it last.
      return test.matches !== undefined ? STANDARD :
             test.msMatchesSelector !== undefined ? MSSTANDARD :
             test.webkitMatchesSelector !== undefined ? WEBKITSTANDARD :
             test.mozMatchesSelector !== undefined ? FIREFOXSTANDARD :
             -1;
    })();


    var ELEMENT = NodeTypes.ELEMENT;
    var DOCUMENT = NodeTypes.DOCUMENT;

    var is = function (element, selector) {
      var elem = element.dom();
      if (elem.nodeType !== ELEMENT) return false; // documents have querySelector but not matches

      // As of Chrome 34 / Safari 7.1 / FireFox 34, everyone except IE has the unprefixed function.
      // Still check for the others, but do it last.
      else if (selectorType === STANDARD) return elem.matches(selector);
      else if (selectorType === MSSTANDARD) return elem.msMatchesSelector(selector);
      else if (selectorType === WEBKITSTANDARD) return elem.webkitMatchesSelector(selector);
      else if (selectorType === FIREFOXSTANDARD) return elem.mozMatchesSelector(selector);
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

    return {
      all: all,
      is: is,
      one: one
    };
  }
);
