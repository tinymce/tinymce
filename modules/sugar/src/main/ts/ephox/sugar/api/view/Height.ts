import { Dimension } from '../../impl/Dimension';
import * as RuntimeSize from '../../impl/RuntimeSize';
import * as SugarBody from '../node/SugarBody';
import { SugarElement } from '../node/SugarElement';
import * as Css from '../properties/Css';

const api = Dimension('height', (element: SugarElement<HTMLElement>) => {
  // getBoundingClientRect gives better results than offsetHeight for tables with captions on Firefox
  const dom = element.dom;
  return SugarBody.inBody(element) ? dom.getBoundingClientRect().height : dom.offsetHeight;
});

const set = (element: SugarElement<HTMLElement>, h: number | string): void => api.set(element, h);

const get = (element: SugarElement<HTMLElement>): number => api.get(element);

const getOuter = (element: SugarElement<HTMLElement>): number => api.getOuter(element);

const getInner = RuntimeSize.getInnerHeight;

const getRuntime = RuntimeSize.getHeight;

const setMax = (element: SugarElement<HTMLElement>, value: number): void => {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  const inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-height', absMax + 'px');
};

export {
  set,
  get,
  getInner,
  getOuter,
  getRuntime,
  setMax
};
