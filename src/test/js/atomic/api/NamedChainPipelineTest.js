asynctest(
    'NamedChainPipelineTest',

    [
      'ephox.agar.api.Pipeline',
      'ephox.agar.api.Chain',
      'ephox.agar.api.NamedChain',
      'global!setTimeout'
    ],

    function (Pipeline, Chain, NamedChain, setTimeout) {
      var success = arguments[arguments.length-2];
      var failure = arguments[arguments.length-1];

      var cAcc = function (ch) {
        return Chain.on(function (input, next, die) {
          next(Chain.wrap(input + ch));
        });
      };

      NamedChain.pipeline([
        NamedChain.writeValue('value', 1),
        NamedChain.overwrite('value', cAcc(2)),
        NamedChain.overwrite('value', cAcc(3)),
        NamedChain.output('value')
      ], function (result) {
          try {
            assert.eq(6, result);
            success();
          } catch (err) {
              failure(err);
          }
      }, failure);
    }
  );