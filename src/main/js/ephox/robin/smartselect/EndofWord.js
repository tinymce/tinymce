define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.perhaps.Option',
    'ephox.robin.data.WordRange',
    'ephox.robin.util.CurrentWord',
    'ephox.sugar.api.Compare'
  ],

  function (Option, WordRange, CurrentWord, Compare) {
    /*
     * Returns an optional range which represents the selection of an entire word which may span 
     * several elements.
     */
    var select = function (universe, textitem, offset, cluster) {
      var getText = function (target) {
        return universe.property().isText(target) ? universe.property().getText(target) : '';
      };

      var text = universe.property().getText(textitem);
      var parts = CurrentWord.around(text, offset);

      var isLeftEdge = cluster.length > 0 && Compare.eq(cluster[0].item(), textitem);
      var isRightEdge = cluster.length > 0 && Compare.eq(cluster[cluster.length - 1].item(), textitem);

      var leftmost = parts.before().fold(function () {

      });

      var neither = function () {
        return isLeftEdge || isRightEdge ? Option.none() :
          Option.some(WordRange(leftmost.element(), leftmost.offset(), rightmost.element(), rightmost.offset()));
      };

      var justBefore = function (bindex) {
        return isRightEdge ? Option.none() : Option.some(WordRange(textitem, bindex, rightmost.element(), rightmost.offset()));
      };

      var justAfter = function (aindex) {
        return isLeftEdge ? Option.none() : Option.some(WordRange(leftmost.element(), leftmost.offset(), textitem, aindex));
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
