import { UnitTest } from '@ephox/bedrock';
import { Chain } from 'ephox/agar/api/Chain';
import { NamedChain } from 'ephox/agar/api/NamedChain';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';
import { TestLogs } from '../../../../main/ts/ephox/agar/api/Main';


UnitTest.asynctest('NamedChainPipelineTest', function() {
  const success = arguments[arguments.length-2];
  const failure = arguments[arguments.length-1];

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
        RawAssertions.assertEq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure, TestLogs.init());
});

