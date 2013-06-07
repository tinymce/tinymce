define(
  'ephox.phoenix.wrap.DomWraps',

  [
    'ephox.peanut.Fun',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert'
  ],

  function (Fun, Element, Insert) {

    var simple = function () {
      var span = Element.fromTag('span');
      return basic(span);
    };

    var basic = function (elem) {

      var element = Fun.constant(elem);
      var wrap = function (w) {
        Insert.append(elem, w);
      };

      return {
        element: element,
        wrap: wrap
      };
    };

    return {
      simple: simple,
      basic: basic
    };
  }
);
