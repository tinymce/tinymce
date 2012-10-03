define(
  'ephox.phoenix.search.Mogel',

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
      var patterns = Arr.map(ps, function (x) {
        var safeX = x.replace(/[-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
        return {
          word: x,
          pattern: Pattern.word(safeX)
        };
      });

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

        while (start < text.length) {
          var candidates = Arr.bind(patterns, function (y) {
            var found = Find.from(text, y.pattern, start);
            return found.fold(function () {
              return [];
            }, function (v) {
              return [{ pattern: y.pattern, word: y.word, range: v }];
            });
          });

          var lowest = Arr.foldl(candidates, function (b, a) {
            return b.range === undefined || a.range[0] < b.range[0] ? a : b;
          }, {});

          var pattern = lowest.pattern && lowest.range ? Option.some(lowest) : Option.none();
          pattern.fold(function () {
            start = text.length;
          }, function (v) {
            // FIX this (need to use structs. Check offset by one)

            var first = v.range[0];
            var last = v.range[1] + 1;

            var newbie = PositionArray.splitAt(structure, first, last, splitter, splitter);
      
            var sub = PositionArray.sub(newbie, first, last);
             
            var subelements = Arr.map(sub, function (z) {

              return z.element();
            });

            matches.push([v.word, subelements]);
            start = last;
          });
        }

        return Arr.map(matches, function (y) {
          return {
            elements: Fun.constant(y[1]),
            word: Fun.constant(y[0])
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
