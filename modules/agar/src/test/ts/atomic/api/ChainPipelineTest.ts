import { UnitTest } from '@ephox/bedrock';
import { Chain } from 'ephox/agar/api/Chain';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';

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
        RawAssertions.assertEq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure);
});
