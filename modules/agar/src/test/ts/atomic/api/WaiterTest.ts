import { UnitTest } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as Waiter from 'ephox/agar/api/Waiter';
import StepAssertions from 'ephox/agar/test/StepAssertions';

UnitTest.asynctest('WaiterTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const makeTryUntilStep = function (label, interval, amount) {
    let counter = 0;
    return Waiter.sTryUntil(
      label + ': TryUntil counter',
      Step.stateful(function (_value, next, die) {
        counter++;
        if (counter === 5) return next(counter);
        else die('did not reach number');
      }),
      interval,
      amount
    );
  };

  const makeTryUntilNotStep = function (label, interval, amount) {
    let counter = 0;
    return Waiter.sTryUntilNot(
      label + ': TryUntilNot counter',
      Step.stateful(function (_value, next, die) {
        counter++;
        if (counter < 10) return next('Not yet');
        else die(counter);
      }),
      interval,
      amount
    );
  };

  const makeDelayStep = function (label, timeout, delay) {
    return Waiter.sTimeout(
      label + ': Waiter timeout',
      Step.async(function (next, die) {
        setTimeout(function () {
          next();
        }, delay);
      }), timeout);
  };

  Pipeline.async({}, [
    StepAssertions.passed('tryUntil with enough time', 5, makeTryUntilStep('enough time', 100, 1000)),
    StepAssertions.failed(
      'tryUntil with *NOT* enough time',
      'Waited for 200ms for something to be successful. not enough time: TryUntil counter\ndid not reach number',
      makeTryUntilStep('not enough time', 100, 200)
    ),

    StepAssertions.passed('tryUntilNot with enough time', StepAssertions.preserved(), makeTryUntilNotStep('enough time', 100, 2000)),
    StepAssertions.failed(
      'tryUntilNot with *NOT* enough time',
      'Waited for 200ms for something to be unsuccessful. not enough time: TryUntilNot counter',
      makeTryUntilNotStep('not enough time', 100, 200)
    ),

    StepAssertions.passed(
      'timeout with enough time',
      StepAssertions.preserved(),
      makeDelayStep('enough time', 1000, 200)
    ),

    StepAssertions.failed(
      'timeout with *NOT* enough time',
      'Hit the limit (300) for: not enough time: Waiter timeout',
      makeDelayStep('not enough time', 300, 2000)
    )


  ], function () { success(); }, failure);
});

