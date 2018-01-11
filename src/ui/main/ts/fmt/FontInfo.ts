/**
 * FontInfo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/dom/DOMUtils';

/**
 * Internal class for computing font size for elements.
 *
 * @private
 * @class tinymce.fmt.FontInfo
 */

const getSpecifiedFontProp = function (propName, rootElm, elm) {
  while (elm !== rootElm) {
    if (elm.style[propName]) {
      const foundStyle = elm.style[propName];
      return foundStyle !== '' ? Option.some(foundStyle) : Option.none();
    }
    elm = elm.parentNode;
  }
  return Option.none();
};

const round = function (number, precision) {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = function (fontSize, precision?) {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const normalizeFontFamily = function (fontFamily) {
  // 'Font name', Font -> Font name,Font
  return fontFamily.replace(/[\'\"]/g, '').replace(/,\s+/g, ',');
};

const getComputedFontProp = function (propName, elm) {
  return Option.from(DOMUtils.DOM.getStyle(elm, propName, true));
};

const getFontProp = function (propName) {
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

export default {
  getFontSize: getFontProp('fontSize'),
  getFontFamily: Fun.compose(normalizeFontFamily, getFontProp('fontFamily')),
  toPt
};