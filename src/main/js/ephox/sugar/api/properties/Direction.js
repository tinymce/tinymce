define(
  'ephox.sugar.api.properties.Direction',

  [
    'ephox.sugar.api.properties.Css'
  ],

  function (Css) {
    var onDirection = function (isLtr, isRtl) {
      return function (element) {
        return getDirection(element) === 'rtl' ? isRtl : isLtr;
      };
    };

    var getDirection = function (element) {
      return Css.get(element, 'direction') === 'rtl' ? 'rtl' : 'ltr';
    };

    return {
      onDirection: onDirection,
      getDirection: getDirection
    };
  }
);