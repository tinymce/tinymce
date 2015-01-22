define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.perhaps.Option',
    'ephox.robin.data.WordRange',
    'ephox.robin.util.CurrentWord',
    'ephox.robin.words.Clustering'
  ],

  function (Option, WordRange, CurrentWord, Clustering) {
    var toEnd = function (cluster, start, soffset) {
      if (cluster.length === 0) return Option.none();
      var last = cluster[cluster.length - 1];
      return Option.some(WordRange(start, soffset, last.item(), last.finish()));
    };

    var fromStart = function (cluster, finish, foffset) {
      if (cluster.length === 0) return Option.none();
      var first = cluster[0];
      return Option.some(WordRange(first.item(), first.start(), finish, foffset));
    };

    var all = function (cluster) {
      if (cluster.length === 0) return Option.none();
      var first = cluster[0];
      var last = cluster[cluster.length - 1];
      return Option.some(WordRange(first.item(), first.start(), last.item(), last.finish()));
    };

    /*
     * Returns an optional range which represents the selection of an entire word which may span 
     * several elements.
     */
    var select = function (universe, textitem, offset) {
      var getText = function (target) {
        return universe.property().isText(target) ? universe.property().getText(target) : '';
      };

      var text = universe.property().getText(textitem);
      var parts = CurrentWord.around(text, offset);

      var neither = function () {
        var cluster = Clustering.words(universe, textitem);
        var atRightEdge = offset === text.length && cluster.right().length === 0;
        var atLeftEdge = offset === 0 && cluster.left().length === 0;
        return atLeftEdge || atRightEdge ? Option.none() : all(cluster.all());
      };

      var justBefore = function (bindex) {
        var cluster = Clustering.words(universe, textitem);
        var atRightEdge = offset === text.length && cluster.right().length === 0;
        return atRightEdge ? Option.none() : toEnd(cluster.all(), textitem, bindex);
      };

      var justAfter = function (aindex) {
        var cluster = Clustering.words(universe, textitem);
        var atLeftEdge = offset === 0 && cluster.left().length === 0;
        return atLeftEdge ? Option.none() : fromStart(cluster.all(), textitem, aindex);
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
