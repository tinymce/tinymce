define(
  'ephox.sugar.api.view.Width',

  [
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.impl.Dimension'
  ],

  function (Css, Dimension) {
    var api = Dimension('width', function (element) {
      // IMO passing this function is better than using dom['offset' + 'width']
      return element.dom().offsetWidth;
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
      var inclusions = [ 'margin-left', 'border-left-width', 'padding-left', 'padding-right', 'border-right-width', 'margin-right' ];
      var absMax = api.max(element, value, inclusions);
      Css.set(element, 'max-width', absMax + 'px');
    };

    return {
      set: set,
      get: get,
      getOuter: getOuter,
      setMax: setMax
    };
  }
);
