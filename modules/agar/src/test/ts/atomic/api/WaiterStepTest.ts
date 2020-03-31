import { UnitTest } from '@ephox/bedrock-client';
import { setTimeout } from '@ephox/dom-globals';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as Waiter from 'ephox/agar/api/Waiter';
import * as StepAssertions from 'ephox/agar/test/StepAssertions';

UnitTest.asynctest('WaiterTest', (success, failure) => {

  const makeTryUntilStep = (label, interval, amount) => {
    let counter = 0;
    return Waiter.sTryUntil(
      label + ': TryUntil counter',
      Step.stateful((_value, next, die) => {
        counter++;
        if (counter === 5) {
          return next(counter);
        } else {
          die('did not reach number');
        }
      }),
      interval,
      amount
    );
  };

  const makeTryUntilNotStep = (label, interval, amount) => {
    let counter = 0;
    return Waiter.sTryUntilNot(
      label + ': TryUntilNot counter',
      Step.stateful((_value, next, die) => {
        counter++;
        if (counter < 10) {
          return next('Not yet');
        } else {
          die(counter);
        }
      }),
      interval,
      amount
    );
  };

  const makeDelayStep = (label, timeout, delay) =>
    Waiter.sTimeout(
      label + ': Waiter timeout',
      Step.async((next, _die) => {
        setTimeout(() => {
          next();
        }, delay);
      }), timeout);

  Pipeline.async({}, [
    StepAssertions.passed('tryUntil with enough time', 5, makeTryUntilStep('enough time', 10, 1000)),
    StepAssertions.failed(
      'tryUntil with *NOT* enough time',
      'Waited for 150ms for something to be successful. not enough time: TryUntil counter\ndid not reach number',
      makeTryUntilStep('not enough time', 50, 150)
    ),

    StepAssertions.passed('tryUntilNot with enough time', StepAssertions.preserved(), makeTryUntilNotStep('enough time', 10, 2000)),
    StepAssertions.failed(
      'tryUntilNot with *NOT* enough time',
      'Waited for 100ms for something to be unsuccessful. not enough time: TryUntilNot counter',
      makeTryUntilNotStep('not enough time', 40, 100)
    ),

    StepAssertions.passed(
      'timeout with enough time',
      StepAssertions.preserved(),
      makeDelayStep('enough time', 1000, 10)
    ),

    StepAssertions.failed(
      'timeout with *NOT* enough time',
      'Hit the limit (50) for: not enough time: Waiter timeout',
      makeDelayStep('not enough time', 50, 500)
    )

  ], () => {
    success();
  }, failure);
});
