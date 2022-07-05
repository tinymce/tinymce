import { Fun, Obj, Optional } from '@ephox/katamari';
import { Attribute, Compare, Css, SugarElement, SugarNode, TransformFind } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';

const legacyPropNames: Record<string, string> = {
  'font-size': 'size',
  'font-family': 'face'
};

const isFont = SugarNode.isTag('font');

const getSpecifiedFontProp = (propName: string, rootElm: Element, elm: HTMLElement): Optional<string> => {
  const getProperty = (elm: SugarElement<Node>) => Css.getRaw(elm, propName).orThunk(() => {
    if (isFont(elm)) {
      return Obj.get(legacyPropNames, propName).bind((legacyPropName) => Attribute.getOpt(elm, legacyPropName));
    } else {
      return Optional.none();
    }
  });
  const isRoot = (elm: SugarElement<Node>) => Compare.eq(SugarElement.fromDom(rootElm), elm);

  return TransformFind.closest(SugarElement.fromDom(elm), (elm) => getProperty(elm), isRoot);
};

const round = (number: number, precision: number): number => {
  const factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
};

const toPt = (fontSize: string, precision?: number): string => {
  if (/[0-9.]+px$/.test(fontSize)) {
    // Round to the nearest 0.5
    return round(parseInt(fontSize, 10) * 72 / 96, precision || 0) + 'pt';
  }
  return fontSize;
};

const normalizeFontFamily = (fontFamily: string) =>
  // 'Font name', Font -> Font name,Font
  fontFamily.replace(/[\'\"\\]/g, '').replace(/,\s+/g, ',');

const getComputedFontProp = (propName: string, elm: HTMLElement): Optional<string> => Optional.from(DOMUtils.DOM.getStyle(elm, propName, true));

const getFontProp = (propName: string) => (rootElm: Element, elm: Node): string => Optional.from(elm)
  .map(SugarElement.fromDom)
  .filter(SugarNode.isElement)
  .bind((element: any) => getSpecifiedFontProp(propName, rootElm, element.dom)
    .or(getComputedFontProp(propName, element.dom)))
  .getOr('');

const getFontSize = getFontProp('font-size');

const getFontFamily = Fun.compose(normalizeFontFamily, getFontProp('font-family')) as (rootElm: Element, elm: Node) => string;

export {
  getFontSize,
  getFontFamily,
  toPt
};
