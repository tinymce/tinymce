test(
  'UntabulateTest',

  [
    'ephox.katamari.api.Jam'
  ],

  function (Jam) {
    var check = function (expected, input) {
      var actual = Jam.untabulate(input);
      assert.eq(expected, actual);
    };

    check([
      {a: 'a', b: 'b'},
      {a: undefined, b: 'b'},
      {a: 'a', b: undefined}
    ], {
      a: ['a', undefined, 'a'],
      b: ['b', 'b', undefined]
    });

    check([
      {a: 'a1', b: undefined, c: undefined, d: 'd1'},
      {a: 'a2', b: undefined, c: 'c2', d: 'd2'},
      {a: undefined, b:undefined, c: 'c3', d: 'd3'},
      {a: undefined, b: 'b4', c: 'c4', d: 'd4'},
      {a: 'a5', b: undefined, c: 'c5', d: 'd5'}
    ], {
      a: ['a1', 'a2', undefined, undefined, 'a5'],
      b: [undefined, undefined, undefined, 'b4', undefined],
      c: [undefined, 'c2', 'c3', 'c4', 'c5'],
      d: ['d1', 'd2', 'd3', 'd4', 'd5']
    });
  }
);