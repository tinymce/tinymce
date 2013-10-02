define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.data.WordRange',
    'ephox.robin.util.WordUtil'
  ],

  function (Arr, Fun, Option, Spot, WordRange, WordUtil) {
    var select = function (universe, item, offset, left, right) {
      var getText = function (target) {
        return universe.property().isText(target) ? universe.property().getText(target) : '';
      };

      // ASSUMPTION: item is a text node. Probably an invalid assumption. Clean this up.
      var text = universe.property().getText(item);
      var parts = WordUtil.around(text, offset);

      var leftText = Arr.map(left, function (l) {
        return getText(l.element()).substring(l.offset());
      }).join('');

      var rightText = Arr.map(right, function (r) {
        return getText(r.element()).substring(0, r.offset());
      }).join('');

      var start = Option.from(left[0]).getOr(Spot.point(item, 0));
      var finish = Option.from(right[right.length - 1]).getOr(Spot.point(item, text.length));
      var current = WordRange(item, offset, item, offset);

      var isLeftEdge = function () {
        return leftText.length === 0 && offset === 0;
      };

      var isRightEdge = function () {
        return rightText.length === 0 && offset === text.length;
      };

      var neither = function () {
        return isLeftEdge() || isRightEdge() ? current : WordRange(start.element(), start.offset(), finish.element(), finish.offset());
      };

      var justBefore = function (bindex) {
        return isRightEdge() ? current : WordRange(item, bindex, finish.element(), finish.offset());
      };

      var justAfter = function (aindex) {
        return isLeftEdge() ? current : WordRange(start.element(), start.offset(), item, aindex);
      };

      var both = function (bindex, aindex) {
        return WordRange(item, bindex, item, aindex);
      };

      return parts.before().fold(function () {
        return parts.after().fold(function () {
          return neither();
        }, function (a) {
          return justAfter(a);
        });
      }, function (b) {
        return parts.after().fold(function () {
          return justBefore(b);
        }, function (a) {
          return both(b, a);
        });
      });
    };

    return {
      select: select
    };
  }
);
