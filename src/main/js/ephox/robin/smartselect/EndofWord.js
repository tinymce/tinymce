define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.api.data.Spot',
    'ephox.robin.data.WordRange',
    'ephox.robin.util.CurrentWord'
  ],

  function (Arr, Option, Spot, WordRange, CurrentWord) {
    var select = function (universe, textitem, offset, left, right) {
      var getText = function (target) {
        return universe.property().isText(target) ? universe.property().getText(target) : '';
      };

      var text = universe.property().getText(textitem);
      var parts = CurrentWord.around(text, offset);

      var leftText = Arr.map(left, function (l) {
        return getText(l.element()).substring(l.offset());
      }).join('');

      var rightText = Arr.map(right, function (r) {
        return getText(r.element()).substring(0, r.offset());
      }).join('');

      var start = Option.from(left[0]).getOr(Spot.point(textitem, 0));
      var finish = Option.from(right[right.length - 1]).getOr(Spot.point(textitem, text.length));
      var current = WordRange(textitem, offset, textitem, offset);

      var isLeftEdge = function () {
        return leftText.length === 0 && offset === 0;
      };

      var isRightEdge = function () {
        return rightText.length === 0 && offset === text.length;
      };

      var neither = function () {
        return isLeftEdge() || isRightEdge() ? Option.none() :
          Option.some(WordRange(start.element(), start.offset(), finish.element(), finish.offset()));
      };

      var justBefore = function (bindex) {
        return isRightEdge() ? Option.none() : Option.some(WordRange(textitem, bindex, finish.element(), finish.offset()));
      };

      var justAfter = function (aindex) {
        return isLeftEdge() ? Option.none() : Option.some(WordRange(start.element(), start.offset(), textitem, aindex));
      };

      var both = function (bindex, aindex) {
        return bindex === aindex ? Option.none() : Option.some(WordRange(textitem, bindex, textitem, aindex));
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
