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

    var check = function (expected, method, input, anchorId, itemId) {
      var family = Tracks.track(input, Option.none());
      var anchor = Locator.byId(family, anchorId).getOrDie();
      var item = Locator.byId(family, itemId).getOrDie();
      method(anchor, item);
      assert.eq(expected, Logger.basic(family));
    };

    var checkBefore = function (expected, input, anchorId, itemId) {
      check(expected, Insertion.before, input, anchorId, itemId);
    };

    var checkAfter = function (expected, input, anchorId, itemId) {
      check(expected, Insertion.after, input, anchorId, itemId);
    };

    var checkWrap = function (expected, input, anchorId, wrapper) {
      var family = Tracks.track(input, Option.none());
      var anchor = Locator.byId(family, anchorId).getOrDie();
      Insertion.wrap(anchor, wrapper);
      assert.eq(expected, Logger.basic(family));
    };

    // initially A(B,C(D(E),F))
    checkBefore('A(B,C(D(F,E)))', data(), 'E', 'F');
    checkBefore('A(F,B,C(D(E)))', data(), 'B', 'F');
    checkBefore('A(B,C(E,D,F))', data(), 'D', 'E');

    checkAfter('A(B,F,C(D(E)))', data(), 'B', 'F');
    checkAfter('A(B,C(D,E,F))', data(), 'D', 'E');

    checkWrap('A(B,C(D(WRAPPER(E)),F))', data(), 'E', { id: 'WRAPPER' });
    checkWrap('A(WRAPPER(B),C(D(E),F))', data(), 'B', { id: 'WRAPPER' });
  }
);
