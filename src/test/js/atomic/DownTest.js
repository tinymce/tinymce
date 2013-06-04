test(
  'DownTest',

  [
    'ephox.boss.mutant.Down',
    'ephox.boss.mutant.Gene',
    'ephox.boss.mutant.Tracks',
    'ephox.compass.Arr',
    'ephox.perhaps.Option'
  ],

  function (Down, Gene, Tracks, Arr, Option) {
    var family = Tracks.track(
      Gene('1', 'root', [
        Gene('1.1', 'duck', [
          Gene('1.1.1', 'goose', []),
          Gene('1.1.2', 'goose', [
            Gene('1.1.2.1', 'duck', []),
            Gene('1.1.2.2', 'duck', [
              Gene('1.1.2.2.1', 'goose', [])
            ])
          ]),
          Gene('1.1.3', 'duck', []),
          Gene('1.1.4', 'duck', [
            Gene('1.1.4.1', 'duck', [])
          ])
        ])
      ]), Option.none());

    var check = function (expected, query) {
      var actual = Down.selector(family, query);
      assert.eq(expected, Arr.map(actual, function (item) {
        return item.id;
      }));
    };

    check(['1.1.1', '1.1.2', '1.1.2.2.1'], 'goose');
    check(['1.1', '1.1.2.1', '1.1.2.2', '1.1.3', '1.1.4', '1.1.4.1'], 'duck');
    check(['1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1'], 'duck,goose');
    check(['1.1', '1.1.1', '1.1.2', '1.1.2.1', '1.1.2.2', '1.1.2.2.1', '1.1.3', '1.1.4', '1.1.4.1'], 'root,duck,goose');
  }
);
