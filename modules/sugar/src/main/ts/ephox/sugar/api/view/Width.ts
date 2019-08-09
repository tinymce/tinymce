import * as Css from '../properties/Css';
import Dimension from '../../impl/Dimension';
import Element from '../node/Element';
import { HTMLElement, Node as DomNode, Element as DomElement } from '@ephox/dom-globals';

const api = Dimension('width', function (element: Element<HTMLElement>) {
  // IMO passing this function is better than using dom['offset' + 'width']
  return element.dom().offsetWidth;
});

const set = function (element: Element<DomNode>, h: string | number) {
  api.set(element, h);
};

const get = function (element: Element<HTMLElement>) {
  return api.get(element);
};

const getOuter = function (element: Element<HTMLElement>) {
  return api.getOuter(element);
};

const setMax = function (element: Element<DomElement>, value: number) {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  const inclusions = [ 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-width', absMax + 'px');
};

export {
  set,
  get,
  getOuter,
  setMax,
};