import { Dimension } from '../../impl/Dimension';
import * as RuntimeSize from '../../impl/RuntimeSize';
import { SugarElement } from '../node/SugarElement';
import * as Css from '../properties/Css';

const api = Dimension('width', (element: SugarElement<HTMLElement>) =>
  // IMO passing this function is better than using dom['offset' + 'width']
  element.dom.offsetWidth
);

const set = (element: SugarElement<HTMLElement>, h: string | number): void => api.set(element, h);

const get = (element: SugarElement<HTMLElement>): number => api.get(element);

const getOuter = (element: SugarElement<HTMLElement>): number => api.getOuter(element);

const getInner = RuntimeSize.getInnerWidth;

const getRuntime = RuntimeSize.getWidth;

const setMax = (element: SugarElement<HTMLElement>, value: number): void => {
  // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
  const inclusions = [ 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right' ];
  const absMax = api.max(element, value, inclusions);
  Css.set(element, 'max-width', absMax + 'px');
};

export {
  set,
  get,
  getInner,
  getOuter,
  getRuntime,
  setMax
};
