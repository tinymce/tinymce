import Chain from 'ephox/agar/api/Chain';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('ChainPipelineTest', function() {
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
        RawAssertions.assertEq('Expected result to be the sum', 6, result);
        success();
      } catch (err) {
          failure(err);
      }
  }, failure);
});

