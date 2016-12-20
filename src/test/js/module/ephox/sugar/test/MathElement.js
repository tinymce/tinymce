define(
  'ephox.sugar.test.MathElement',

  [
    'ephox.sugar.api.node.Element'
  ],

  function (Element) {
    return function () {
      return Element.fromHtml('<math xmlns="http://www.w3.org/1998/Math/MathML"></math>');
    };
  }
);
