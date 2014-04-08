test(
  'AttributionTest',

  [
    'ephox.boss.mutant.Attribution'
  ],

  function (Attribution) {

    var item = {
      attrs: {
        border: '10'
      }
    };

    assert.eq({ border: '10' }, item.attrs);
    Attribution.set(item, 'cat', 'mogel');
    assert.eq({ border: '10', cat: 'mogel' }, item.attrs);
    Attribution.remove(item, 'cat');
    assert.eq({ border: '10' }, item.attrs);
    assert.eq('10', Attribution.get(item, 'border'));
  }
);
