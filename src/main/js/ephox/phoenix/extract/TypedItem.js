define(
  'ephox.phoenix.extract.TypedItem',

  [
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  /**
   * Church encoded ADT representing whether an element is:
   * - boundary (block tag or inline tag with block CSS display)
   * - empty
   * - text
   */
  function (Fun, Option) {
    var no = Fun.constant(false);
    var yes = Fun.constant(true);

    var boundary = function (item, universe) {
      return folder(function (b, e, t) {
        return b(item, universe);
      });
    };

    var empty = function (item, universe) {
      return folder(function (b, e, t) {
        return e(item, universe);
      });
    };

    var text = function (item, universe) {
      return folder(function (b, e, t) {
        return t(item, universe);
      });
    };

    var folder = function (fold) {
      var isBoundary = function () {
        return fold(yes, no, no);
      };

      var toText = function () {
        return fold(Option.none, Option.none, function (item, universe) {
          return Option.some(item);
        });
      };

      var is = function (other) {
        return fold(no, no, function (item, universe) {
          return universe.eq(item, other);
        });
      };

      var len = function () {
        return fold(Fun.constant(0), Fun.constant(1), function (item, universe) {
          return universe.property().getText(item).length;
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
