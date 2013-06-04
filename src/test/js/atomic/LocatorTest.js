test(
  'LocatorTest',

  [
    'ephox.boss.mutant.Locator'
  ],

  function (Locator) {
    var family = {
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

    assert.eq('D', Locator.byId(family, 'D').getOrDie().id);
    assert.eq('A', Locator.byId(family, 'A').getOrDie().id);
    assert.eq(true, Locator.byId(family, 'Z').isNone());

  }
);
