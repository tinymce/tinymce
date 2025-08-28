import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as fc from 'fast-check';

import { Pipeline } from 'ephox/agar/api/Pipeline';
import * as PropertySteps from 'ephox/agar/api/PropertySteps';
import { Step } from 'ephox/agar/api/Step';

UnitTest.asynctest('PropertyStepsTest', (success, failure) => {

  // NOTE: Make this fail to test output errors.
  Pipeline.async({}, [
    PropertySteps.sAsyncProperty(
      'Check number dividing by 1 is itself',
      [ fc.integer() ],
      Step.stateful((num: number, next, _die) => {
        Assert.eq('x / 1 === x', num, num / 1);
        next(num);
      }),
      {}
    )
  ], success, failure);
});
