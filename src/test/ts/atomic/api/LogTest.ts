import { UnitTest } from "@ephox/bedrock";
import { Pipeline, Step, Assertions } from "../../../../main/ts/ephox/agar/api/Main";
import StepAssertions from "../../module/ephox/agar/test/StepAssertions";
import Log from "../../../../main/ts/ephox/agar/api/Log";

UnitTest.asynctest('LogTest', (success, failure) => {
  const logStepTest = StepAssertions.testStepsFail(
    'TestCase-01-Step failure',
    [
      Log.step('01', 'Step failure', Assertions.sAssertEq('Assert failure', true, false))
    ]
  );

  Pipeline.async({}, [
    logStepTest
  ], success, failure);

});