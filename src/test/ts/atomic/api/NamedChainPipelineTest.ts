import { UnitTest } from '@ephox/bedrock';
import { Chain, Wrap } from 'ephox/agar/api/Chain';
import { NamedChain } from 'ephox/agar/api/NamedChain';
import * as RawAssertions from 'ephox/agar/api/RawAssertions';

import { DieFn, NextFn } from '../../../../main/ts/ephox/agar/pipe/Pipe';

UnitTest.asynctest('NamedChainPipelineTest', function() {
  const success = arguments[arguments.length-2];
  const failure = arguments[arguments.length-1];

  const cAcc = function (ch: number) {
    return Chain.on(function (input: number, next: NextFn<Wrap<number>>, die: DieFn) {
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
        RawAssertions.assertEq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure);
});

