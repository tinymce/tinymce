/**
 * FontInfo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Internal class for computing font size for elements.
 *
 * @private
 * @class tinymce.fmt.FontInfo
 */
define(
  'tinymce.core.fmt.FontInfo',
  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'tinymce.core.dom.DOMUtils'
  ],
  function (Fun, Option, Element, Node, DOMUtils) {
    var getSpecifiedFontProp = function (propName, rootElm, elm) {
      while (elm !== rootElm) {
        if (elm.style[propName]) {
          var foundStyle = elm.style[propName];
          return foundStyle !== '' ? Option.some(foundStyle) : Option.none();
        }
        elm = elm.parentNode;
      }
      return Option.none();
    };

    var toPt = function (fontSize) {
      if (/[0-9.]+px$/.test(fontSize)) {
        return Math.round(parseInt(fontSize, 10) * 72 / 96) + 'pt';
      }

      return fontSize;
    };

    var normalizeFontFamily = function (fontFamily) {
      // 'Font name', Font -> Font name,Font
      return fontFamily.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
    };

    var getComputedFontProp = function (propName, elm) {
      return Option.from(DOMUtils.DOM.getStyle(elm, propName, true));
    };

    var getFontProp = function (propName) {
      return function (rootElm, elm) {
        return Option.from(elm)
          .map(Element.fromDom)
          .filter(Node.isElement)
          .bind(function (element) {
            return getSpecifiedFontProp(propName, rootElm, element.dom())
              .or(getComputedFontProp(propName, element.dom()));
          })
          .getOr('');
      };
    };

    return {
      getFontSize: getFontProp('fontSize'),
      getFontFamily: Fun.compose(normalizeFontFamily, getFontProp('fontFamily')),
      toPt: toPt
    };
  }
);
