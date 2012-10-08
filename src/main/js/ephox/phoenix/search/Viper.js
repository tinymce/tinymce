define(
  'ephox.phoenix.search.Viper',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.group.Group',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.str.Find',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, Group, Pattern, PositionArray, List, Find, Element, Insert, Text) {

    var splitter = function (offset, a) {
      var r = (function () {
        if (offset > a.start() && offset < a.finish()) {
          var newA = Spot.range(a.element(), a.start(), offset);
          var text = Text.get(a.element());
          Text.set(a.element(), text.substring(0, offset - a.start()));
          var firstSplit = Element.fromText(text.substring(offset - a.start()));
          Insert.after(a.element(), firstSplit);
          return [newA, Spot.range(firstSplit, offset, a.finish())];
        } else {
          return [a];
        }
      })();
      return r;
    };

    var mogel = function (elements, ps) {
      console.log('ps: ', ps);
      var patterns = (function () {
        return Arr.map(ps, function (x) {
          var safeX = x.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
          return {
            word: x,
            pattern: Pattern.word(safeX)
          };
        });
      })();

      var sections = Group.group(elements);
      var result = Arr.bind(sections, function (x) {
        var input = List.justText(x);
        var text = Arr.map(input, Text.get).join('');
        var structure = PositionArray.make(input, function (x, offset) {
          var finish = offset + Text.get(x).length;
          return Option.from(Spot.range(x, offset, finish));
        });

        var start = 0;
        var matches = [];

        var newbie = structure;

        var magik = Arr.bind(patterns, function (y) {
          var results = Find.viper(text, y.pattern);
          return Arr.map(results, function (z) {
            return { word: y.word, start: z[0], finish: z[1] };
          });
        });

        var magikclone = Array.prototype.slice.call(magik, 0);
        magikclone.sort(function (a, b) {
          if (a.start < b.start) return -1;
          else if (b.start < a.start) return 1;
          else return 0;
        });

        /* Not great that newbie changes outside and inside the map */
        return Arr.map(magikclone, function (y) {
          newbie = PositionArray.splitAt(newbie, y.start, y.finish, splitter, splitter);
          var sub = PositionArray.sub(newbie, y.start, y.finish);
          return {
            elements: Fun.constant(Arr.map(sub, function (z) { return z.element(); })),
            word: Fun.constant(y.word)
          };
        });
      });

      return result;
    };
      
    return {
      mogel: mogel
    };
  }
);
