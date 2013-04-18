define(
  'ephox.robin.words.Cluster',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.phoenix.data.Spot',
    'ephox.phoenix.extract.Extract',
    'ephox.phoenix.gather.Gather',
    'ephox.phoenix.util.arr.Split',
    'ephox.phoenix.util.node.Classification',
    'ephox.robin.api.Zone',
    'ephox.robin.words.Identify',
    'ephox.robin.words.Prune',
    'ephox.robin.words.Transform',
    'ephox.sugar.api.Text'
  ],

  function (Arr, Fun, Spot, Extract, Gather, Split, Classification, Zone, Identify, Prune, Transform, Text) {
    var generate = function (element) {
      var gathered = Gather.gather(element, Prune, Transform);
      var left = gathered.left();
      var right = gathered.right();

      console.log('left: ', left.length);
      console.log('right: ', right.length);

      var inner = Extract.all(element);
      var middle = Arr.map(inner, function (x) {
        return Spot.text(x, Text.getOption(x).getOr(''));
      });

      console.log('middle: ', middle.length);

      var elements = left.concat(middle).concat(right);
      console.log('all: ', Arr.map(elements, function (x) { return x.element().dom(); }));
      var groups = Split.split(elements, function (x) {
        var elem = x.element();
        return Classification.isBoundary(elem) || Classification.isEmpty(elem);
      });

      console.log('groups: ', Arr.map(groups, function (x) {
        return Arr.map(x, function (y) {
          return y.element().dom().nodeValue;
        });
      }));

      var words = Arr.bind(groups, function (x) {
        var text = Arr.bind(x, function (y) {
          console.log('y.text: ', y.text());
          return y.text();
        }).join('');
        return Identify.words(text);
      });

      var baseElements = Arr.map(elements, function (x) {
        return x.element();
      });
      var zone = Zone.constant(baseElements);
      return {
        zone: Fun.constant(zone),
        words: Fun.constant(words)
      };
    };

    var empty = function () {
      return {
        zone: Zone.empty,
        words: Fun.constant([])
      };
    };

    return {
      generate: generate,
      empty: empty
    };
  }
);
