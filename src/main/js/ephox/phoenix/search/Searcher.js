define(
  'ephox.phoenix.search.Searcher',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.search.Match',
    'ephox.phoenix.util.arr.PositionArray',
    'ephox.phoenix.util.doc.List',
    'ephox.phoenix.util.option.Pipe',
    'ephox.phoenix.util.str.Find',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Option, Spot, Match, PositionArray, List, Pipe, Find, Text) {

    var search = function (elements, pattern) {

      var input = List.justText(elements);

      var text = Arr.map(input, Text.get).join('');
      var indices = Find.all(text, pattern.term());

      console.log('found: ', pattern.term(), ' at: ', indices);

      var structure = PositionArray.make(input, function (x, offset) {
        var finish = offset + Text.get(x).length;
        return Option.from(Spot.range(x, offset, finish));
      });

      var pos = function (list, index) {
        var item = PositionArray.getAt(list, index);
        return item.map(function (v) {
          return Spot.point(v.element(), index - v.start());
        });
      };

      return Arr.bind(indices, function (x) {
        var first = pos(structure, x);
        var last = pos(structure, x + pattern.length());
        var match = Pipe.pipe(first, last, Match);
        return match.fold(Fun.constant([]), function (xx) {
          return [xx];
        });
      });
    };

    return {
      search: search
    };
  }
);
