import { UnitTest } from '@ephox/bedrock-client';
import { Chain } from 'ephox/agar/api/Chain';
import * as Logger from 'ephox/agar/api/Logger';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as StepAssertions from 'ephox/agar/test/StepAssertions';

UnitTest.asynctest('ChainTest', (success, failure) => {

  const cIsEqual = (expected) =>
    Chain.async((actual, next, die) => {
      if (expected === actual) {
        next(actual);
      } else {
        die('Cat is not a dog');
      }
    });

  const cIsEqualAndChange = (expected, newValue) =>
    Chain.async((actual, next, die) => {
      if (expected === actual) {
        next(newValue);
      } else {
        die('Cat is not a dog');
      }
    });

  const acc = (ch) => Chain.async((input, next, die) => {
    next(input + ch);
  });
  const testInputValueFails = StepAssertions.testStepsFail(
    'Output value is not a chain: dog',
    [
      Chain.asStep({}, [
        Chain.on((cInput, cNext, cDie, cLogs) => {
          cNext(<any> 'dog', cLogs);
        })
      ])
    ]
  );

  const testInputValuePasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie, cLogs) {
          cNext('doge', cLogs);
        })
      ])
    ]
  );

  const testInputValueOfUndefinedPasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie, cLogs) {
          cNext(undefined, cLogs);
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
        next(value);
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
        Chain.wait(5)
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
  ], () => {
    success();
  }, failure);
});

UnitTest.asynctest('Chain.predicate true', (success, failure) => {
  Pipeline.async('stepstate', [
    StepAssertions.testStepsPass(
      'stepstate',
      [Chain.asStep('chicken', [Chain.predicate((x) => {
        return x === 'chicken';
      })])]
    )
  ], () => success(), failure);
});

UnitTest.asynctest('Chain.predicate false', (success, failure) => {
  Pipeline.async('stepstate', [
    StepAssertions.testStepsFail(
      'predicate did not succeed',
      [Chain.asStep('chicken', [Chain.predicate((x) => x === 'frog')])]
    )
  ], () => success(), failure);
});
