/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, HTMLElement, Node } from '@ephox/dom-globals';
import { Fun, Obj, Option } from '@ephox/katamari';
import { Attr, Compare, Css, Element as SugarElement, Node as SugarNode, TransformFind } from '@ephox/sugar';
import DOMUtils from '../api/dom/DOMUtils';

const legacyPropNames: Record<string, string> = {
  'font-size': 'size',
  'font-family': 'face'
};

const getSpecifiedFontProp = (propName: string, rootElm: Element, elm: HTMLElement): Option<string> => {
  const getProperty = (elm: SugarElement) => {
    return Css.getRaw(elm, propName).orThunk(() => {
      if (SugarNode.name(elm) === 'font') {
        return Obj.get(legacyPropNames, propName).bind((legacyPropName) => Attr.getOpt(elm, legacyPropName));
      } else {
        return Option.none();
      }
    });
  };
  const isRoot = (elm: SugarElement) => Compare.eq(SugarElement.fromDom(rootElm), elm);

  return TransformFind.closest(SugarElement.fromDom(elm), (elm) => getProperty(elm), isRoot);
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
      .map(SugarElement.fromDom)
      .filter(SugarNode.isElement)
      .bind((element: any) => {
        return getSpecifiedFontProp(propName, rootElm, element.dom())
          .or(getComputedFontProp(propName, element.dom()));
      })
      .getOr('');
  };
};

export default {
  getFontSize: getFontProp('font-size'),
  getFontFamily: Fun.compose(normalizeFontFamily, getFontProp('font-family')) as (rootElm: Element, elm: Node) => string,
  toPt
};
