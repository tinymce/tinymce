test(
  'CreatorTest',

  [
    'ephox.boss.mutant.Creator'
  ],

  function (Creator) {
    assert.eq({ id: 'clone**<c>', name: 'cat', children: [] }, Creator.clone({ id: 'c', name: 'cat', children: [ 'kittens' ] }));
  }
);
