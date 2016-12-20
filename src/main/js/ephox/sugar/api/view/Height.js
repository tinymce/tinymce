define(
  'ephox.sugar.api.view.Height',

  [
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.impl.Dimension'
  ],

  function (Css, Dimension) {
    var api = Dimension('height', function (element) {
      // IMO passing this function is better than using dom['offset' + 'height']
      return element.dom().offsetHeight;
    });

    var set = function (element, h) {
      api.set(element, h);
    };

    var get = function (element) {
      return api.get(element);
    };

    var getOuter = function (element) {
      return api.getOuter(element);
    };

    var setMax = function (element, value) {
      // These properties affect the absolute max-height, they are not counted natively, we want to include these properties.
      var inclusions = [ 'margin-top', 'border-top-width', 'padding-top', 'padding-bottom', 'border-bottom-width', 'margin-bottom' ];
      var absMax = api.max(element, value, inclusions);
      Css.set(element, 'max-height', absMax + 'px');
    };

    return {
      set: set,
      get: get,
      getOuter: getOuter,
      setMax: setMax
    };
  }
);
