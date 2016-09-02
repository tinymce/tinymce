test(
  'IndexOfTest',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.test.arb.ArbDataTypes',
    'ephox.wrap.Jsc'
  ],
  function(Arr, ArbDataTypes, Jsc) {
    assert.eq(-1, Arr.indexOf([], 'x'));
    assert.eq(-1, Arr.indexOf(['q'], 'x'));
    assert.eq(-1, Arr.indexOf([1], '1'));
    assert.eq(-1, Arr.indexOf([1], undefined));
    assert.eq(0, Arr.indexOf([undefined], undefined));
    assert.eq(0, Arr.indexOf([undefined, undefined], undefined));
    assert.eq(1, Arr.indexOf([1, undefined], undefined));
    assert.eq(2, Arr.indexOf(['dog', 3, 'cat'], 'cat'));

    // We use this property because duplicates cause problems
    Jsc.property(
      'indexOf(slice, val) == 0 if slice starts with val',
      Jsc.array(Jsc.json),
      function (arr) {
        return Arr.forall(arr, function (x, i) {
          var index = Arr.indexOf(arr.slice(i), x);
          return 0 === index;
        });
      }
    );

    Jsc.property(
      'indexOf(unique_arr, val) === iterator index',
      ArbDataTypes.indexArrayOf(10),
      function (arr) {
        return Arr.forall(arr, function (x, i) {
          var index = Arr.indexOf(arr, x);
          return i === index;
        });
      }
    );

    Jsc.property(
      'indexOf of an empty array is -1',
      Jsc.json,
      function (json) {
        return Arr.indexOf([ ], json) === -1;
      }
    );

    Jsc.property(
      'indexOf of a [value].concat(array) is 0',
      Jsc.array(Jsc.json),
      Jsc.json,
      function (arr, json) {
        return Arr.indexOf([ json ].concat(arr), json) === 0;
      }
    );
  }
);