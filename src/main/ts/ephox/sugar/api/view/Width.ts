import Css from '../properties/Css';
import Dimension from '../../impl/Dimension';
import Element from '../node/Element';
import { HTMLElement } from '@ephox/dom-globals';

var api = Dimension('width', function (element: Element) {
  // IMO passing this function is better than using dom['offset' + 'width']
  return (element.dom() as HTMLElement).offsetWidth;
});

var set = function (element: Element, h: string | number) {
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
  var inclusions = [ 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right' ];
  var absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-width', absMax + 'px');
};

export default {
  set,
  get,
  getOuter,
  setMax,
};