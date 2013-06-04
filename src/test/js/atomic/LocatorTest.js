test(
  'LocatorTest',

  [
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Tracks',
    'ephox.perhaps.Option'
  ],

  function (Locator, Tracks, Option) {
    var family = Tracks.track({
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
    }, Option.none());

    assert.eq('D', Locator.byId(family, 'D').getOrDie().id);
    assert.eq('A', Locator.byId(family, 'A').getOrDie().id);
    assert.eq(true, Locator.byId(family, 'Z').isNone());


    assert.eq(1, Locator.index(Locator.byId(family, 'C').getOrDie()));

  }
);
