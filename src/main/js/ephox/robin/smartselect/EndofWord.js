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
    var mogel = function (universe, item, offset, left, right) {      
      // ASSUMPTION: item is a text node. Probably an invalid assumption. Clean this up.
      var text = universe.property().getText(item);
      var parts = WordUtil.around(text, offset);

      /* Check the text node length of the items left. If text length is zero, then at end of word */
      var leftText = Arr.map(left, function (l) {
        var elem = l.element();
        return universe.property().isText(elem) ? universe.property().getText(elem).substring(l.offset()) : '';
      }).join('');

      var rightText = Arr.map(right, function (r) {
        var elem = r.element();
        return universe.property().isText(elem) ? universe.property().getText(elem).substring(0, r.offset()) : '';
      }).join('');

      var start = Option.from(left[0]).getOr(Spot.point(item, 0));
      var finish = Option.from(right[right.length - 1]).getOr(Spot.point(item, text.length));
      var current = WordRange(item, offset, item, offset);

      var neither = function () {
        console.log('neither');
        if ((leftText.length === 0 && offset === 0) || (rightText.length === 0 && offset === text.length)) return current;
        else return WordRange(start.element(), start.offset(), finish.element(), finish.offset());
      };

      var justBefore = function (bindex) {
        console.log('just.before', bindex);
        if (rightText.length === 0 && offset === text.length) return current;
        else return WordRange(item, bindex, finish.element(), finish.offset());
      };

      var justAfter = function (aindex) {
        console.log('just.after', aindex);
        if (leftText.length === 0 && offset === 0) return current;
        else return WordRange(start.element(), start.offset(), item, aindex);
      };

      var both = function (bindex, aindex) {
        console.log('both', bindex, aindex);
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
      mogel: mogel
    };
  }
);
