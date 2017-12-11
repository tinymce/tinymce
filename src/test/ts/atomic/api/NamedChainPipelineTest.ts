import Chain from 'ephox/agar/api/Chain';
import NamedChain from 'ephox/agar/api/NamedChain';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('NamedChainPipelineTest', function() {
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
        RawAssertions.assertEq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure);
});

