import { UnitTest } from '@ephox/bedrock';
import { Chain } from 'ephox/agar/api/Chain';
import * as Logger from 'ephox/agar/api/Logger';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import StepAssertions from 'ephox/agar/test/StepAssertions';

UnitTest.asynctest('ChainTest', function() {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const cIsEqual = function (expected) {
    return Chain.async(function (actual, next, die) {
      if (expected === actual) next(actual);
      else die('Cat is not a dog');
    });
  };

  const cIsEqualAndChange = function (expected, newValue) {
    return Chain.async(function (actual, next, die) {
      if (expected === actual) next(newValue);
      else die('Cat is not a dog');
    });
  };

  const acc = function (ch) {
    return Chain.async(function (input, next, die) {
      next(input + ch);
    });
  };
  const testInputValueFails = StepAssertions.testStepsFail(
    'Output value is not a chain: dog',
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie, cLogs) {
          cNext(<any>'dog', cLogs);
        })
      ])
    ]
  );

  const testInputValuePasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie, cLogs) {
          cNext(Chain.wrap('doge'), cLogs);
        })
      ])
    ]
  );

  const testInputValueOfUndefinedPasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie, cLogs) {
          cNext(Chain.wrap(undefined), cLogs);
        })
      ])
    ]
  );

  const testChainingFails = StepAssertions.testStepsFail(
    'Cat is not a dog',
    [
      Chain.asStep({}, [
        Chain.inject('dog'),
        cIsEqual('cat')
      ])
    ]
  );

  const testChainingPasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep('value', [
        Chain.inject('cat'),
        cIsEqual('cat')
      ])
    ]
  );

  const testChainingFailsBecauseChanges = StepAssertions.testStepsFail(
   'Cat is not a dog',
   [
     Chain.asStep('value', [
       Chain.inject('cat'),
       cIsEqualAndChange('cat', 'new.cat'),
       cIsEqualAndChange('cat', 'new.dog')
     ])
   ]
 );

  const testChainParentPasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.fromParent(
          Chain.inject('cat'),
          [
            cIsEqualAndChange('cat', 'new.cat'),
            cIsEqualAndChange('cat', 'new.dog'),
            cIsEqualAndChange('cat', 'new.elephant')
          ]
        )
      ])
    ]
  );

  const testChainParentAcc = StepAssertions.testChain(
    'Sentence: ',
    Chain.fromParent(
      Chain.inject('Sentence: '), [
        acc('T'),
        acc('h'),
        acc('i'),
        acc('s')
      ]
    )
  );

  const testChainAcc = StepAssertions.testChain(
    'Sentence: This',
    Chain.fromChainsWith('Sentence: ', [
      acc('T'),
      acc('h'),
      acc('i'),
      acc('s')
    ])
  );

  const testChainEnforcesInput = StepAssertions.testStepsFail(
    'Input Value is not a chain: raw.input',
    [
      Step.raw(function (_, next, die, logs) {
        Chain.on(function (input: any, n, d, clogs) {
          n(input, clogs);
        }).runChain(<any>'raw.input', next, die, logs);
      })
    ]
  );

  const testChainAsync = StepAssertions.testChain(
    'async works!',
    Chain.async((_value, next) => {
      next('async works!');
    })
  );

  const testChainAsyncFail = StepAssertions.testChainFail(
    'async fails!',
    {},
    Chain.async((_value, _next, die) => {
      die('async fails!');
    })
  );

  const testChainAsyncChain = StepAssertions.testChain(
    'async chains!',
    Chain.fromChains([
      Chain.inject('async chains!'),
      Chain.async((value, next, _die) => {
        next(value)
      })
    ])
  );

  const testChainRunStepsOnValue = StepAssertions.testChain(
    'runSteps*runStepsOnValue=succ!',
    Chain.fromChains([
      Chain.inject('runSteps'),
      Chain.runStepsOnValue(
        (s: string) => [
          Step.stateful((initial, next, die) => {
            next(initial + '*' + s + 'OnValue');
          }),
          Step.stateful((v, next, die) => {
            next(v + '=succ!');
          })
        ]
      )
    ])
  );

  const testChainInjectThunked = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.injectThunked(() => 'cat'),
        cIsEqual('cat')
      ])
    ]
  );

  return Pipeline.async({}, [
    Logger.t(
      '[Should fail validation if the chain function does not wrap the output]\n',
      testInputValueFails
    ),
    Logger.t(
      '[Should pass validation if the chain function does wrap the output]\n',
      testInputValuePasses
    ),
    Logger.t(
      '[Should pass validation if the chain function does wrap the output, even if that output is undefined]\n',
      testInputValueOfUndefinedPasses
    ),
    Logger.t(
      '[When a previous link passes a failure that fails a chain, the step should fail]\n',
      testChainingFails
    ),
    Logger.t(
      '[When the last link passes a success, the step should pass]\n',
      testChainingPasses
    ),
    Logger.t(
      '[When using parent, each chain gets the first input]\n',
      testChainParentPasses
    ),
    Logger.t(
      '[When not using parent, if the chain changes the value, subsequent asserts fail]\n',
      testChainingFailsBecauseChanges
    ),
    Logger.t(
      '[When using parent, chains do not accumulate when passing]\n',
      testChainParentAcc
    ),
    Logger.t(
      '[When using fromChains, chains do accumulate when passing]\n',
      testChainAcc
    ),
    Logger.t(
      '[Chains should enforce input conditions]\n',
      testChainEnforcesInput
    ),

    Logger.t(
      '[Chain should async]\n',
      testChainAsync
    ),

    Logger.t(
      '[Chain should async fail]\n',
      testChainAsyncFail
    ),

    Logger.t(
      '[Chain should async chain]\n',
      testChainAsyncChain
    ),

    Logger.t(
      '[Basic API: Chain.log]\n',
      Chain.asStep({}, [
        Chain.log('message')
      ])
    ),

    Logger.t(
      '[Basic API: Chain.debugging]\n',
      Chain.asStep({}, [
        Chain.debugging
      ])
    ),

    Logger.t(
      '[Basic API: Chain.wait]\n',
      Chain.asStep({}, [
        Chain.wait(1000)
      ])
    ),

    Logger.t(
      '[Complex API: Chain.runStepsOnValue\n',
      testChainRunStepsOnValue
    ),

    Logger.t(
      '[Basic API: Chain.injectThunked\n',
      testChainInjectThunked
    )
  ], function () {
    success();
  }, failure);
});

