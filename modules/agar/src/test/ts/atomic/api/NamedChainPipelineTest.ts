import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Chain } from 'ephox/agar/api/Chain';
import { NamedChain } from 'ephox/agar/api/NamedChain';
import { TestLogs } from 'ephox/agar/api/TestLogs';

UnitTest.asynctest('NamedChainPipelineTest', function (success, failure) {

  const cAcc = function (ch: number) {
    return Chain.async((input: number, next, die) => {
      next(input + ch);
    });
  };

  NamedChain.pipeline([
    NamedChain.writeValue('value', 1),
    NamedChain.overwrite('value', cAcc(2)),
    NamedChain.overwrite('value', cAcc(3)),
    NamedChain.output('value')
  ], function (result) {
      try {
        Assert.eq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure, TestLogs.init());
});
