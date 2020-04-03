import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Chain } from 'ephox/agar/api/Chain';

UnitTest.asynctest('ChainPipelineTest', (success, failure) => {

  const cAcc = (ch) => Chain.async((input, next, _die) => {
    next(input + ch);
  });

  Chain.pipeline([
    Chain.inject(1),
    cAcc(2),
    cAcc(3)
  ], (result) => {
    try {
      Assert.eq('Expected result to be the sum', 6, result);
      success();
    } catch (err) {
      failure(err);
    }
  }, failure);
});
