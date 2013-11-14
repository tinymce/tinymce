define(
  'ephox.snooker.adjust.Dimensions',

  [
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width',
    'global!Math'
  ],

  function (Css, Height, Width, Math) {
    var hacktastic = function (element) {
      var w = Width.get(element);
      Width.set(element, w);
      return w - Width.get(element);
    };

    var hacky = function (element) {
      var h = Height.get(element);
      Height.set(element, h);
      return h - Height.get(element);
    };

    var adjust = function (element, x, y) {
      // var width = Width.get(element) + hacktastic(element);
      // var height = Height.get(element) + hacky(element);
      // var w = Math.max(1, width + x);
      // var h = Math.max(1, height + y);
      // Width.set(element, w);
      // Height.set(element, h);
      var width = getWidth(element);
      // var height = Height.get(element);
      var w = Math.max(1, width + x);
      // var h = Math.max(1, height + y);
      setWidth(element, w);
    };

    var setWidth = function (element, w) {
      Css.set(element, 'width', w + 'px');
      // Width.set(element, w + hacktastic(element));
    };

    var getWidth = function (element) {
      return parseInt(Css.get(element, 'width'), 10);
      // return Width.get(element) + hacktastic(element);
    };

    var addWidth = function (element, amount) {
      var current = parseInt(Css.get(element, 'width'), 10);
      console.log('current: ', current);
      Css.set(element, 'width', current + amount + 'px');
      //var current = Width.get(element) + hacktastic(element);
      // var current = Width.get(element);
      //Width.set(element, current + amount);
    };

    return {
      adjust: adjust,
      setWidth: setWidth,
      getWidth: getWidth,
      addWidth: addWidth
    };
  }
);