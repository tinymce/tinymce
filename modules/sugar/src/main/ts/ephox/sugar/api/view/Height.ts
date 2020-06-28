import { Element as DomElement, HTMLElement, Node as DomNode } from '@ephox/dom-globals';
import Dimension from '../../impl/Dimension';
import * as Body from '../node/Body';
import Element from '../node/Element';
import * as Css from '../properties/Css';

const api = Dimension('height', (element: Element<HTMLElement>): number => {
  // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
  const dom = element.dom();
  return Body.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
});

const set = (element: Element<DomNode>, h: number | string): void =>
  api.set(element, h);

const get = (element: Element<HTMLElement>): number =>
  api.get(element);

const getOuter = (element: Element<HTMLElement>): number =>
  api.getOuter(element);

const setMax = (element: Element<DomElement>, value: number): void => {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  const inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-height', absMax + 'px');
};

export {
  set,
  get,
  getOuter,
  setMax
};
