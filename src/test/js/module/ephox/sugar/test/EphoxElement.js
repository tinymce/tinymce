define(
  'ephox.sugar.test.EphoxElement',

  [
    'ephox.sugar.api.node.Element'
  ],

  function (Element) {
    return function (type) {
      var dom = document.createElement(type);
      return Element.fromDom(dom);
    };
  }
);
