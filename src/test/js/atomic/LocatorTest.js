test(
  'LocatorTest',

  [
    'ephox.boss.mutant.Creator',
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Tracks',
    'ephox.perhaps.Option'
  ],

  function (Creator, Locator, Tracks, Option) {
    var family = Tracks.track({
      id: 'A',
      children: [
        { id: 'B', children: [ ] },
        { id: 'C', children: [
          { id: 'D', children: [
            { id: 'E', children: [] }
          ]},
          { id: 'F', children: [] },
          Creator.text('cattle')
        ]}
      ]
    }, Option.none());

    assert.eq('D', Locator.byId(family, 'D').getOrDie().id);
    assert.eq('A', Locator.byId(family, 'A').getOrDie().id);
    assert.eq(true, Locator.byItem(family, { id: '?_cattle' }).isNone());
    assert.eq(false, Locator.byItem(family, Locator.byId(family, '?_cattle').getOrDie()).isNone());
    assert.eq(true, Locator.byId(family, 'Z').isNone());


    assert.eq(1, Locator.index(Locator.byId(family, 'C').getOrDie()));

  }
);
