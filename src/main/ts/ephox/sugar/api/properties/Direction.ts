import Css from './Css';

var onDirection = function (isLtr, isRtl) {
  return function (element) {
    return getDirection(element) === 'rtl' ? isRtl : isLtr;
  };
};

var getDirection = function (element) {
  return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
};

export default <any> {
  onDirection: onDirection,
  getDirection: getDirection
};