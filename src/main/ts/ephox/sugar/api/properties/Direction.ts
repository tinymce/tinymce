import Css from './Css';
import Element from '../node/Element';

var onDirection = function<T = any> (isLtr: T, isRtl: T) {
  return function (element: Element) {
    return getDirection(element) === 'rtl' ? isRtl : isLtr;
  };
};

var getDirection = function (element: Element) {
  return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
};

export default {
  onDirection,
  getDirection,
};