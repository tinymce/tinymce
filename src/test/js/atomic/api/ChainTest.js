import Chain from 'ephox/agar/api/Chain';
import Logger from 'ephox/agar/api/Logger';
import Pipeline from 'ephox/agar/api/Pipeline';
import Step from 'ephox/agar/api/Step';
import StepAssertions from 'ephox/agar/test/StepAssertions';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('ChainTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var cIsEqual = function (expected) {
    return Chain.on(function (actual, next, die) {
      if (expected === actual) next(Chain.wrap(actual));
      else die('Cat is not a dog');
    });
  };

  var cIsEqualAndChange = function (expected, newValue) {
    return Chain.on(function (actual, next, die) {
      if (expected === actual) next(Chain.wrap(newValue));
      else die('Cat is not a dog');
    });
  };

  var acc = function (ch) {
    return Chain.on(function (input, next, die) {
      next(Chain.wrap(input + ch));
    });
  };
  var testInputValueFails = StepAssertions.testStepsFail(
    'Output value is not a chain: dog', 
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie) {
          cNext('dog');
        })
      ])
    ]
  );

  var testInputValuePasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep({}, [
        Chain.on(function (cInput, cNext, cDie) {
          cNext(Chain.wrap('doge'));
        })
      ])
    ]
  );

  var testChainingFails = StepAssertions.testStepsFail(
    'Cat is not a dog',
    [
      Chain.asStep({}, [
        Chain.inject('dog'),
        cIsEqual('cat')
      ])
    ]
  );

  var testChainingPasses = StepAssertions.testStepsPass(
    {},
    [
      Chain.asStep('value', [
        Chain.inject('cat'),
        cIsEqual('cat')
      ])
    ]
  );

  var testChainingFailsBecauseChanges = StepAssertions.testStepsFail(
   'Cat is not a dog',
   [
     Chain.asStep('value', [
       Chain.inject('cat'),
       cIsEqualAndChange('cat', 'new.cat'),
       cIsEqualAndChange('cat', 'new.dog')
     ])
   ]
 );

  var testChainParentPasses = StepAssertions.testStepsPass(
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

  var testChainParentAcc = StepAssertions.testChain(
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

  var testChainAcc = StepAssertions.testChain(
    'Sentence: This',
    Chain.fromChainsWith('Sentence: ', [
      acc('T'),
      acc('h'),
      acc('i'),
      acc('s')
    ])
  );

  var testChainEnforcesInput = StepAssertions.testStepsFail(
    'Input Value is not a chain: raw.input',
    [
      Step.async(function (next, die) {
        Chain.on(function (input, n, d) {
          n(input);
        }).runChain('raw.input', next, die);
      })
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
    )
  ], function () {
    success();
  }, failure);
});

