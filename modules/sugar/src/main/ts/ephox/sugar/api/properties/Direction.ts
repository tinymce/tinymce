import * as Css from './Css';
import Element from '../node/Element';

const onDirection = function<T = any> (isLtr: T, isRtl: T) {
  return function (element: Element) {
    return getDirection(element) === 'rtl' ? isRtl : isLtr;
  };
};

const getDirection = function (element: Element) {
  return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
};

export {
  onDirection,
  getDirection,
};