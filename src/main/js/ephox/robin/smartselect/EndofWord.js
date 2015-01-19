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
      console.log('first: ', first.text(), 'last', last.text());
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
      console.log('textitem: ', Text.get(textitem), offset);
      var parts = CurrentWord.around(text, offset);

      var neither = function () {
        console.log('use all of cluster', cluster);
        return all(cluster);
      };

      var justBefore = function (bindex) {
        console.log('use end of cluster');
        return toEnd(cluster, textitem, bindex);
      };

      var justAfter = function (aindex) {
        console.log('use start of cluster');
        return fromStart(cluster, textitem, aindex);
      };

      var both = function (bindex, aindex) {
        console.log('just use node');
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
