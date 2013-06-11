test(
  'CreatorTest',

  [
    'ephox.boss.mutant.Creator'
  ],

  function (Creator) {
    assert.eq({ name: 'cat', children: [] }, Creator.clone({ name: 'cat', children: [ 'kittens' ] }));
  }
);
