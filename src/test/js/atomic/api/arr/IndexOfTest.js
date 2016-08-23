test(
  'IndexOfTest',

  [
    'ephox.katamari.api.Arr'
  ],
  function(Arr) {
    assert.eq(-1, Arr.indexOf([], 'x'));
    assert.eq(-1, Arr.indexOf(['q'], 'x'));
    assert.eq(-1, Arr.indexOf([1], '1'));
    assert.eq(-1, Arr.indexOf([1], undefined));
    assert.eq(0, Arr.indexOf([undefined], undefined));
    assert.eq(0, Arr.indexOf([undefined, undefined], undefined));
    assert.eq(1, Arr.indexOf([1, undefined], undefined));
    assert.eq(2, Arr.indexOf(['dog', 3, 'cat'], 'cat'));
  }
);