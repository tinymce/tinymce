test(
  'InsertionTest',

  [
    'ephox.boss.mutant.Insertion',
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Logger',
    'ephox.boss.mutant.Tracks',
    'ephox.perhaps.Option'
  ],

  function (Insertion, Locator, Logger, Tracks, Option) {
    var check = function (expected, input, anchorId, itemId) {
      var family = Tracks.track(input, Option.none());
      var anchor = Locator.byId(family, anchorId).getOrDie();
      var item = Locator.byId(family, itemId).getOrDie();
      Insertion.before(anchor, item);
      assert.eq(expected, Logger.basic(family));
    };

    check('A(B,C(D(F,E)))', {
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
    }, 'E', 'F');

  }
);
