define(
  'ephox.robin.word.Line',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.util.arr.Split',
    'ephox.phoenix.util.node.Classification',
    'ephox.robin.data.LineInfo',
    'ephox.robin.gather.Transform',
    'ephox.robin.prune.PotentialWord',
    'ephox.robin.word.Identify',
    'ephox.robin.zone.Zone',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Spot, Extract, Gather, Split, Classification, LineInfo, Transform, PotentialWord, Identify, Zone, Element, Text) {

    // Sort of need this.
    var all = function (element) {
      var extractions = Extract.from(element);
      var fakeNode = Element.fromText(' ');

      // ASSUMPTION: This elements/text correlation is never used to identify location, as it cheats by inserting nodes.
      var nodes = Arr.bind(extractions, function (x) {
        return x.fold(Fun.constant(fakeNode), Fun.constant(fakeNode), function (y) { return [y]; });
       });

      var text = Arr.map(nodes, Text.get).join('');
      var filtered = Arr.filter(nodes, function (x) { return x !== fakeNode; });

      var zone = Zone.basic(filtered);
      var words = Identify.words(text);
      return LineInfo(zone, words);
    };

    var inlineLine = function (element) {
      var gathered = Gather.gather(element, PotentialWord, Transform.word);
      var left = gathered.left();
      var right = gathered.right();
      
      var inner = Extract.all(element);
      var middle = Arr.map(inner, function (x) {
        return Spot.text(x, Text.getOption(x).getOr(''));
      });

      var elements = left.concat(middle).concat(right);
      var groups = Split.split(elements, function (x) {
        var elem = x.element();
        return Classification.isBoundary(elem) || Classification.isEmpty(elem);
      });

      var words = Arr.bind(groups, function (x) {
        var text = Arr.bind(x, function (y) {
          return y.text();
        }).join('');
        return Identify.words(text);
      });

      var baseElements = Arr.map(elements, function (x) {
        return x.element();
      });
      var zone = Zone.basic(baseElements);
      return LineInfo(zone, words);
    };


    var line = function (element) {
      return Classification.isBoundary(element) ? all(element) : inlineLine(element);
    };

    var local = function (element) {
      return Classification.isBoundary(element) ? LineInfo(Zone.basic([]), []) : inlineLine(element);
    };

    return {
      line: line,
      local: local
    };
  }
);
