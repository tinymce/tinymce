import { Arr, Type } from '@ephox/katamari';

import { SugarElement } from '../api/node/SugarElement';
import * as Css from '../api/properties/Css';
import * as Style from './Style';

export interface Dimension {
  readonly get: (element: SugarElement<HTMLElement>) => number;
  readonly set: (element: SugarElement<Node>, value: number | string) => void;
  readonly getOuter: (element: SugarElement<HTMLElement>) => number;
  readonly aggregate: (element: SugarElement<Element>, properties: string[]) => number;
  readonly max: (element: SugarElement<Element>, value: number, properties: string[]) => number;
}

export const Dimension = (name: string, getOffset: (e: SugarElement<HTMLElement>) => number): Dimension => {
  const set = (element: SugarElement<Node>, h: number | string) => {
    if (!Type.isNumber(h) && !h.match(/^[0-9]+$/)) {
      throw new Error(name + '.set accepts only positive integer values. Value was ' + h);
    }
    const dom = element.dom;
    if (Style.isSupported(dom)) {
      dom.style[name as any] = h + 'px';
    }
  };

  /*
   * jQuery supports querying width and height on the document and window objects.
   *
   * TBIO doesn't do this, so the code is removed to save space, but left here just in case.
   */
  /*
  var getDocumentWidth = (element) => {
    var dom = element.dom;
    if (Node.isDocument(element)) {
      var body = dom.body;
      var doc = dom.documentElement;
      return Math.max(
        body.scrollHeight,
        doc.scrollHeight,
        body.offsetHeight,
        doc.offsetHeight,
        doc.clientHeight
      );
    }
  };

  var getWindowWidth = (element) => {
    var dom = element.dom;
    if (dom.window === dom) {
      // There is no offsetHeight on a window, so use the clientHeight of the document
      return dom.document.documentElement.clientHeight;
    }
  };
*/

  const get = (element: SugarElement<HTMLElement>) => {
    const r = getOffset(element);

    // zero or null means non-standard or disconnected, fall back to CSS
    if ( r <= 0 || r === null ) {
      const css = Css.get(element, name);
      // ugh this feels dirty, but it saves cycles
      return parseFloat(css) || 0;
    }
    return r;
  };

  // in jQuery, getOuter replicates (or uses) box-sizing: border-box calculations
  // although these calculations only seem relevant for quirks mode, and edge cases TBIO doesn't rely on
  const getOuter = get;

  const aggregate = (element: SugarElement<Element>, properties: string[]) => Arr.foldl(properties, (acc, property) => {
    const val = Css.get(element, property);
    const value = val === undefined ? 0 : parseInt(val, 10);
    return isNaN(value) ? acc : acc + value;
  }, 0);

  const max = (element: SugarElement<Element>, value: number, properties: string[]) => {
    const cumulativeInclusions = aggregate(element, properties);
    // if max-height is 100px and your cumulativeInclusions is 150px, there is no way max-height can be 100px, so we return 0.
    const absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
    return absoluteMax;
  };

  return {
    set,
    get,
    getOuter,
    aggregate,
    max
  };
};
