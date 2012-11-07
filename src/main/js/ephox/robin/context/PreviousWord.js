define(
  'ephox.robin.context.PreviousWord',

  [
    'ephox.compass.Arr',
    'ephox.perhaps.Option',
    'ephox.phoenix.gather.CharNeighbour',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.search.Pattern',
    'ephox.phoenix.util.str.Find',
    'ephox.robin.data.WordPosition',
    'ephox.robin.gather.Transform',
    'ephox.robin.prune.PotentialWord',
    'ephox.sugar.api.Text',
    'ephox.violin.Strings',
    'global!Math'
  ],

  function (Arr, Option, CharNeighbour, Gather, Pattern, Find, WordPosition, Transform, PotentialWord, Text, Strings, Math) {

    var prevWord = function (element, offset) {
      var next = CharNeighbour.right(element, offset);
      var r = next.fold(function () {
        return left(element, offset);
      }, function (v) {
        return v.search(/\s/) > -1 ? left(element, offset) : Option.none();
      });

      return r.map(function (v) {
        return WordPosition(v.start(), v.offset(), Strings.trim(v.text()));
      });
    };

    var subNode = function (element, offset) {
      return Text.getOption(element).fold(function () {
        return Option.none();
      }, function (v) {
        var sub = v.substring(0, offset);
        var breaks = Find.all(sub, Pattern.token('\\s'));
        return Option.from(breaks[breaks.length - 1]).map(function (vv) {
          var text = sub.substring(vv.finish(), offset);
          return WordPosition(element, vv.finish(), text);
        });
      });
      
    };

    var findFirst = function (left, element) {
      return Option.from(left[0]).fold(function () {
        return WordPosition(element, 0, Text.getOption(element).getOr(''));
      }, function (v) {
        var text = Text.getOption(v.element()).getOr('');
        var off = Math.max(0, text.length - v.text().length);
        return WordPosition(v.element(), off, text);
      });
    };

    var left = function (element, offset) {
      return subNode(element, offset).fold(function () {
        var gathered = Gather.gather(element, PotentialWord, Transform.word);
        var first = findFirst(gathered.left(), element);
        
        var r = Arr.map(gathered.left(), function (x) {
          return x.text();
        }).join('') + Text.get(element);
        return Option.some(WordPosition(first.start(), first.offset(), r));
      }, function (v) {
        return Option.some(v);
      });
    };

    return {
      prevWord: prevWord
    };
  }
);
