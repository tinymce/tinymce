test(
  'RemovalTest',

  [
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Logger',
    'ephox.boss.mutant.Removal',
    'ephox.boss.mutant.Tracks',
    'ephox.perhaps.Option'
  ],

  function (Locator, Logger, Removal, Tracks, Option) {
    var data = function () {
      return {
        id: 'A',
        children: [
          { id: 'B', children: [ ] },
          { id: 'C', children: [
            { id: 'D', children: [
              { id: 'E', children: [] }
            ]},
            { id: 'F', children: [] }
          ]}
        ]
      };
    };

    var check = function (expected, input, itemId) {
      var family = Tracks.track(input, Option.none());
      var item = Locator.byId(family, itemId).getOrDie();
      Removal.unwrap(item);
      assert.eq(expected, Logger.basic(family));
    };

    check('A(B,D(E),F)', data(), 'C');
    check('A(B,C(D,F))', data(), 'E');
  }
);
