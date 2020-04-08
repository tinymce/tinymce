import { Element as DomElement, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import Dimension from '../../impl/Dimension';
import Element from '../node/Element';
import * as Css from '../properties/Css';

const api = Dimension('width', (element: Element<HTMLElement>) =>
  // IMO passing this function is better than using dom['offset' + 'width']
  element.dom().offsetWidth
);

const set = (element: Element<DomNode>, h: string | number) => api.set(element, h);

const get = (element: Element<HTMLElement>) => api.get(element);

const getOuter = (element: Element<HTMLElement>) => api.getOuter(element);

const setMax = (element: Element<DomElement>, value: number) => {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  const inclusions = [ 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-width', absMax + 'px');
};

export {
  set,
  get,
  getOuter,
  setMax
};
