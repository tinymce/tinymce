test(
  'IdTest',

  [
    'ephox.katamari.api.Id'
  ],

  function (Id) {
    var one = Id.generate('test');
    var two = Id.generate('test');
    assert.eq(0, one.indexOf('test'));
    assert.eq(0, two.indexOf('test'));
    assert.eq(false, one === two);
  }
);