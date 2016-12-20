define(
  'ephox.sugar.test.Div',

  [
    'ephox.sugar.api.node.Element'
  ],

  function (Element) {
    return function () {
      return Element.fromTag('div');
    };
  }
);
