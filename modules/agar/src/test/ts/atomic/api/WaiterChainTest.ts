import { UnitTest } from '@ephox/bedrock';
import { setTimeout } from '@ephox/dom-globals';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Chain } from 'ephox/agar/api/Chain';
import * as Waiter from 'ephox/agar/api/Waiter';
import StepAssertions from 'ephox/agar/test/StepAssertions';

UnitTest.asynctest('WaiterChainTest', function (success, failure) {

  const makeTryUntilChain = function (label: string, interval: number, amount: number) {
    let counter = 0;
    return Waiter.cTryUntil(
      label + ': TryUntil counter',
      Chain.on(function (_value, next, die, logs) {
        counter++;
        if (counter === 5) {
          return next(Chain.wrap(counter), logs);
        } else {
          die('did not reach number', logs);
        }
      }),
      interval,
      amount
    );
  };

  const makeTryUntilNotChain = function (label: string, interval: number, amount: number) {
    let counter = 0;
    return Waiter.cTryUntilNot(
      label + ': TryUntilNot counter',
      Chain.on(function (_value, next, die, logs) {
        counter++;
        if (counter < 10) {
          return next(Chain.wrap('not yet'), logs);
        } else {
          die(counter, logs);
        }
      }),
      interval,
      amount
    );
  };

  const makeDelayChain = function (label: string, timeout: number, delay: number) {
    return Waiter.cTimeout(
      label + ': Waiter timeout',
      Chain.on(function (_value, next, die, logs) {
        setTimeout(function () {
          next(Chain.wrap(_value), logs);
        }, delay);
      }), timeout);
  };

  Pipeline.async({}, [
    // tryUntil with enough time
    StepAssertions.testChain(5, makeTryUntilChain('enough time', 10, 1000)),
    // tryUntil with *NOT* enough time
    StepAssertions.testChainFail(
      'Waited for 150ms for something to be successful. not enough time: TryUntil counter\ndid not reach number',
      'dummy initial state',
      makeTryUntilChain('not enough time', 50, 150)
    ),

    // // tryUntilNot with enough time
    StepAssertions.testChain({}, makeTryUntilNotChain('enough time', 10, 2000)),
    // 'tryUntilNot with *NOT* enough time'
    StepAssertions.testChainFail(
      'Waited for 100ms for something to be unsuccessful. not enough time: TryUntilNot counter',
      '####',
      makeTryUntilNotChain('not enough time', 40, 100)
    ),

    // timeout with enough time
    StepAssertions.testChain(
      {},
      makeDelayChain('enough time', 1000, 10)
    ),

    // timeout with *NOT* enough time
    StepAssertions.testChainFail(
      'Hit the limit (50) for: not enough time: Waiter timeout',
      'dummy initial state',
      makeDelayChain('not enough time', 50, 500)
    )

  ], function () { success(); }, failure);
});
