import * as Body from '../node/Body';
import * as Css from '../properties/Css';
import Dimension from '../../impl/Dimension';
import Element from '../node/Element';
import { HTMLElement, Element as DomElement, Node as DomNode } from '@ephox/dom-globals';

const api = Dimension('height', function (element: Element<HTMLElement>) {
  // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
  const dom = element.dom();
  return Body.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
});

const set = function (element: Element<DomNode>, h: number | string) {
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
  const inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-height', absMax + 'px');
};

export {
  set,
  get,
  getOuter,
  setMax,
};