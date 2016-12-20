asynctest(
  'PipelineSuite Test',
  
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'global!setTimeout'
  ],

  function (Pipeline, Step, setTimeout) {
    var success = arguments[arguments.length-2];
    var failure = arguments[arguments.length-1];

    var mutator = function (property, value) {
      return Step.stateful(function (state, next, die) {
        state[property] = value;
        setTimeout(function () {
          next(state);
        }, 10);
      });
    };

    Pipeline.async({}, [
      mutator('name', 'testfile'),
      mutator('purpose', 'unknown'),
      mutator('correctness', 'tbd')
    ], function (result) { 
      assert.eq({
        name: 'testfile',
        purpose: 'unknown',
        correctness: 'tbd'
      }, result);
      success();

    }, failure);
  }
);