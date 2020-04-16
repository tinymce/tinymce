import { Element as DomElement } from '@ephox/dom-globals';
import Element from '../node/Element';
import * as Css from './Css';

const onDirection = <T = any> (isLtr: T, isRtl: T) => (element: Element<DomElement>) => getDirection(element) === 'rtl' ? isRtl : isLtr;

const getDirection = (element: Element<DomElement>): 'rtl' | 'ltr' => Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';

export {
  onDirection,
  getDirection
};
