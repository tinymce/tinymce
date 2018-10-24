import * as Body from '../node/Body';
import * as Css from '../properties/Css';
import Dimension from '../../impl/Dimension';
import Element from '../node/Element';
import { HTMLElement } from '@ephox/dom-globals';

var api = Dimension('height', function (element: Element) {
  // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
  var dom: HTMLElement = element.dom();
  return Body.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
});

var set = function (element: Element, h: number | string) {
  api.set(element, h);
};

var get = function (element: Element) {
  return api.get(element);
};

var getOuter = function (element: Element) {
  return api.getOuter(element);
};

var setMax = function (element: Element, value: number) {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  var inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
  var absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-height', absMax + 'px');
};

export {
  set,
  get,
  getOuter,
  setMax,
};