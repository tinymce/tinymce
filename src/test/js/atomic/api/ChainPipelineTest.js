asynctest(
    'ChainPipelineTest',

    [
      'ephox.agar.api.Pipeline',
      'ephox.agar.api.Chain',
      'global!setTimeout'
    ],

    function (Pipeline, Chain, setTimeout) {
      var success = arguments[arguments.length-2];
      var failure = arguments[arguments.length-1];

      var cAcc = function (ch) {
        return Chain.on(function (input, next, die) {
          next(Chain.wrap(input + ch));
        });
      };

      Chain.pipeline([
        Chain.inject(1),
        cAcc(2),
        cAcc(3)
      ], function (result) {
          try {
            assert.eq(6, result);
            success();
          } catch (err) {
              failure(err);
          }
      }, failure, null, true);
    }
  );