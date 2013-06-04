test(
  'UpTest',

  [
    'ephox.boss.mutant.Locator',
    'ephox.boss.mutant.Tracks',
    'ephox.boss.mutant.Up',
    'ephox.perhaps.Option'
  ],

  function (Locator, Tracks, Up, Option) {

    var family = Tracks.track({
      id: 'A',
      name: '_A_',
      children: [
        { id: 'B', name: '_B_', children: [ ] },
        { id: 'C', name: '_C_', children: [
          { id: 'D', name: '_D_', children: [
            { id: 'E', name: '_E_', children: [] }
          ]},
          { id: 'F', name: '_F_', children: [] }
        ]}
      ]
    }, Option.none());

    var d = Locator.byId(family, 'D').getOrDie();
    assert.eq('A', Up.selector(d, '_A_').getOrDie().id);
    assert.eq('C', Up.selector(d, '_C_').getOrDie().id);
    assert.eq('C', Up.selector(d, '_C_,_A_').getOrDie().id);
    assert.eq('C', Up.selector(d, '_B_,_C_,_A_').getOrDie().id);
    assert.eq('C', Up.selector(d, '_B_,_A_,_C_').getOrDie().id);
    assert.eq(true, Up.selector(d, '_B_,_Z_').isNone());

  }
);
