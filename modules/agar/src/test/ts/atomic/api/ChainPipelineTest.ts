import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Chain } from 'ephox/agar/api/Chain';

UnitTest.asynctest('ChainPipelineTest', function (success, failure) {

  const cAcc = function (ch) {
    return Chain.async(function (input, next, die) {
      next(input + ch);
    });
  };

  Chain.pipeline([
    Chain.inject(1),
    cAcc(2),
    cAcc(3)
  ], function (result) {
      try {
        Assert.eq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure);
});
