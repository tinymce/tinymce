import Pipeline from 'ephox/agar/api/Pipeline';
import PropertySteps from 'ephox/agar/api/PropertySteps';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import Step from 'ephox/agar/api/Step';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('PropertyStepsTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  // NOTE: Make this fail to test output errors.
  Pipeline.async({}, [
    PropertySteps.sAsyncProperty(
      'Check number dividing by 1 is itself',
      [ Jsc.integer ],
      Step.stateful(function (num, next, die) {
        RawAssertions.assertEq('x / 1 === x', num, num / 1);
        next(num);
      }),
      { }
    )
  ], function () { success(); }, failure);
});

