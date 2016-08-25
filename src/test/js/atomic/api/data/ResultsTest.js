test(
  'ResultsTest',

  [
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Results'
  ],

  function (Result, Results) {
    var testPartition = function () {
      var actual = Results.partition([
        Result.value('a'),
        Result.value('b'),
        Result.error('e1'),
        Result.error('e2'),
        Result.value('c'),
        Result.value('d')
      ]);

      assert.eq('a', actual.values[0]);
      assert.eq('b', actual.values[1]);
      assert.eq('c', actual.values[2]);
      assert.eq('d', actual.values[3]);
      assert.eq('e1', actual.errors[0]);
      assert.eq('e2', actual.errors[1]);
    };

    testPartition();
  }
);