/**
 * FontInfo.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun, Option } from '@ephox/katamari';
import { Element, Node } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const getSpecifiedFontProp = (propName: string, rootElm: Element, elm: HTMLElement): Option<string> => {
  while (elm !== rootElm) {
    if (elm.style[propName]) {
      const foundStyle = elm.style[propName];
      return foundStyle !== '' ? Option.some(foundStyle) : Option.none();
    }
    elm = elm.parentNode as HTMLElement;
  }
  return Option.none();
};

const round = (number: number, precision: number) => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number) => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const normalizeFontFamily = (fontFamily: string) => {
  // 'Font name', Font -> Font name,Font
  return fontFamily.replace(/[\'\"\\]/g, '').replace(/,\s+/g, ',');
};

const getComputedFontProp = (propName: string, elm: HTMLElement): Option<string> => {
  return Option.from(DOMUtils.DOM.getStyle(elm, propName, true));
};

const getFontProp = (propName: string) => {
  return (rootElm: Element, elm: Node): string => {
    return Option.from(elm)
      .map(Element.fromDom)
      .filter(Node.isElement)
      .bind((element: any) => {
        return getSpecifiedFontProp(propName, rootElm, element.dom())
          .or(getComputedFontProp(propName, element.dom()));
      })
      .getOr('');
  };
};

export default {
  getFontSize: getFontProp('fontSize'),
  getFontFamily: Fun.compose(normalizeFontFamily, getFontProp('fontFamily')) as (rootElm: Element, elm: Node) => string,
  toPt
};