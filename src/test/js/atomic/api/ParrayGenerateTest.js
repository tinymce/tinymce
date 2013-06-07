test(
  'api.PositionArray.generate',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.polaris.api.PositionArray'
  ],

  function (Arr, Fun, Option, PositionArray) {
    var generator = function (item, start) {
      var firstletter = item[0];
      if (firstletter === 'a') return Option.none();
      return Option.some({
        start: Fun.constant(start),
        finish: Fun.constant(start + item.length),
        item: Fun.constant(item)
      });
    };

    var result = PositionArray.generate([ 'cat', 'dog', 'ab', 'mogel', '', 'hi' ], generator);
    assert.eq([
      '0->3@ cat',
      '3->6@ dog',
      '6->11@ mogel',
      '11->11@ ',
      '11->13@ hi'
    ], Arr.map(result, function (item) {
      return item.start() + '->' + item.finish() + '@ ' + item.item();
    }));
  }
);
