define(
  'ephox.robin.smartselect.EndofWord',

  [
    'ephox.perhaps.Option',
    'ephox.robin.data.WordRange',
    'ephox.robin.util.CurrentWord',
    'ephox.sugar.api.Text'
  ],

  function (Option, WordRange, CurrentWord, Text) {
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
    var select = function (universe, textitem, offset, cluster) {
      var getText = function (target) {
        return universe.property().isText(target) ? universe.property().getText(target) : '';
      };

      var text = universe.property().getText(textitem);
      var parts = CurrentWord.around(text, offset);

      var atRightEdge = offset === text.length && cluster.right().length === 0;
      var atLeftEdge = offset === 0 && cluster.left().length === 0;

      var neither = function () {
        console.log('offset: ', offset, text.length, cluster.left().length, cluster.right().length);
        // var atEdge = offset === 0 || offset === text.length;
        // var hasMore = cluster.left().length > 0 || cluster.right().length > 0;
        return atLeftEdge || atRightEdge ? Option.none() : all(cluster.all());
      };

      var justBefore = function (bindex) {
        console.log(bindex + '..');
        // If at the end of the node, and no break
        return cluster.right().length > 0 || offset < text.length ? toEnd(cluster.all(), textitem, bindex) : Option.none();
      };

      var justAfter = function (aindex) {
        console.log('..' + aindex);
        return fromStart(cluster.all(), textitem, aindex);
      };

      var both = function (bindex, aindex) {
        console.log(bindex + '..' + aindex);
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
