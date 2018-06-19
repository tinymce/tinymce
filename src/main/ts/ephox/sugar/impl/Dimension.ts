import { Type } from '@ephox/katamari';
import { Arr } from '@ephox/katamari';
import Css from '../api/properties/Css';
import Style from './Style';
import Element from '../api/node/Element';

export default function (name: string, getOffset: (e: Element) => number) {
  var set = function (element: Element, h: number | string) {
    if (!Type.isNumber(h) && !h.match(/^[0-9]+$/)) throw name + '.set accepts only positive integer values. Value was ' + h;
    var dom = element.dom();
    if (Style.isSupported(dom)) dom.style[name] = h + 'px';
  };

  /*
   * jQuery supports querying width and height on the document and window objects.
   *
   * TBIO doesn't do this, so the code is removed to save space, but left here just in case.
   */
/*
  var getDocumentWidth = function (element) {
    var dom = element.dom();
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

  var getWindowWidth = function (element) {
    var dom = element.dom();
    if (dom.window === dom) {
      // There is no offsetHeight on a window, so use the clientHeight of the document
      return dom.document.documentElement.clientHeight;
    }
  };
*/


  var get = function (element: Element) {
    var r = getOffset(element);

    // zero or null means non-standard or disconnected, fall back to CSS
    if ( r <= 0 || r === null ) {
      var css = Css.get(element, name);
      // ugh this feels dirty, but it saves cycles
      return parseFloat(css) || 0;
    }
    return r;
  };

  // in jQuery, getOuter replicates (or uses) box-sizing: border-box calculations
  // although these calculations only seem relevant for quirks mode, and edge cases TBIO doesn't rely on
  var getOuter = get;

  var aggregate = function (element: Element, properties) {
    return Arr.foldl(properties, function (acc, property) {
      var val = Css.get(element, property);
      var value = val === undefined ? 0: parseInt(val, 10);
      return isNaN(value) ? acc : acc + value;
    }, 0);
  };

  var max = function (element: Element, value: number, properties) {
    var cumulativeInclusions = aggregate(element, properties);
    // if max-height is 100px and your cumulativeInclusions is 150px, there is no way max-height can be 100px, so we return 0.
    var absoluteMax = value > cumulativeInclusions ? value - cumulativeInclusions : 0;
    return absoluteMax;
  };

  return {
    set,
    get,
    getOuter,
    aggregate,
    max,
  };
};