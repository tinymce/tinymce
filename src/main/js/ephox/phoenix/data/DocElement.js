define(
  'ephox.phoenix.data.DocElement',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Text'
  ],

  function (Fun, Option, Compare, Text) {

    var no = Fun.constant(false);
    var yes = Fun.constant(true);

    var boundary = function () {
      return folder(function (b, e, t) {
        return b();
      });
    };
    
    var empty = function (value) {
      return folder(function (b, e, t) {
        return e(value);
      });
    };

    var text = function (value) {
      return folder(function (b, e, t) {
        return t(value);
      });
    };

    var folder = function (fold) {
      var isBoundary = function () {
        return fold(yes, no, no);
      };

      var toText = function () {
        return fold(Option.none, Option.none, Option.some);
      };

      var is = function (element) {
        return fold(no, no, function (v) {
          return Compare.eq(element, v);
        });
      };

      var len = function () {
        return fold(Fun.constant(0), Fun.constant(1), function (t) {
          return Text.get(t).length;
        });
      };

      return {
        isBoundary: isBoundary,
        fold: fold,
        toText: toText,
        is: is,
        len: len
      };
    };

    return {
      text: text,
      boundary: boundary,
      empty: empty
    };
  }
);
