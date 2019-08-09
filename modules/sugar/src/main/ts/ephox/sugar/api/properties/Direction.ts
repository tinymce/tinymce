import * as Css from './Css';
import Element from '../node/Element';
import { Element as DomElement } from '@ephox/dom-globals';

const onDirection = function<T = any> (isLtr: T, isRtl: T) {
  return function (element: Element<DomElement>) {
    return getDirection(element) === 'rtl' ? isRtl : isLtr;
  };
};

const getDirection = function (element: Element<DomElement>): 'rtl' | 'ltr' {
  return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
};

export {
  onDirection,
  getDirection,
};