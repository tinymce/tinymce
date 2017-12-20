import Chain from 'ephox/agar/api/Chain';
import GeneralSteps from 'ephox/agar/api/GeneralSteps';
import Logger from 'ephox/agar/api/Logger';
import NamedChain from 'ephox/agar/api/NamedChain';
import Pipeline from 'ephox/agar/api/Pipeline';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import StepAssertions from 'ephox/agar/test/StepAssertions';
import { Merger } from '@ephox/katamari';
import { Result } from '@ephox/katamari';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('NamedChainTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  var cIsEqual = function (expected) {
    return Chain.on(function (actual, next, die) {
      if (expected === actual) next(Chain.wrap(actual));
      else die('Unexpected input. Expected: ' + expected + ', Actual: ' + actual);
    });
  };

  var addLetters = function (s) {
    return Chain.mapper(function (input) {
      return input + s;
    });
  };

  var mult10 = Chain.mapper(function (input) {
    return input * 10;
  });

  var doubleNum = Chain.mapper(function (input) {
    return input * 2;
  });

  var wrapObj = function (k, v) {
    var r = { };
    r[k] = v;
    return r;
  };

  Pipeline.async({}, [
    StepAssertions.testStepsPass({}, [
      Chain.asStep('.', [
        NamedChain.asChain([
          NamedChain.write('x', Chain.inject(5)),
          NamedChain.write('y', Chain.inject(8)),
          NamedChain.writeValue('z', 10),
          NamedChain.writeValue('description', 'Q1. What are the answer'),
          
          NamedChain.overwrite('description', addLetters('s')),
          NamedChain.direct('description', addLetters('!'), 'shouting'),

          NamedChain.overwrite('x', doubleNum),
          NamedChain.direct('y', mult10, '10y'),

          NamedChain.merge(['x', 'y', 'z'], 'xyz'),

          NamedChain.read('x', cIsEqual(10)),

          NamedChain.bundle(function (input) {
            RawAssertions.assertEq('Checking bundled chain output', Merger.deepMerge(
              {
                x: 5 * 2,
                y: 8,
                '10y': 80,
                z: 10,
                description: 'Q1. What are the answers',
                shouting: 'Q1. What are the answers!',
                xyz: {
                  x: 10,
                  y: 8,
                  z: 10
                }
              },
              // Also check original value
              wrapObj(NamedChain.inputName(), '.')
            ), input);
            return Result.value(input);
          })
        ])
      ])
    ]),

    Logger.t('Testing NamedChain.output()', GeneralSteps.sequence([
      StepAssertions.testStepsPass({}, [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.write('x', Chain.inject(5)),
            NamedChain.write('y', Chain.inject(8)),
            NamedChain.output('y')
          ]),
          cIsEqual(8)
        ])
      ]),

      StepAssertions.testStepsPass({}, [
        Chain.asStep('input.name.value', [
          NamedChain.asChain([
            NamedChain.write('x', Chain.inject(5)),
            NamedChain.write('y', Chain.inject(8)),
            NamedChain.output(NamedChain.inputName())
          ]),
          cIsEqual('input.name.value')
        ])
      ]),

      StepAssertions.testStepsPass({}, [
        Chain.asStep({ }, [
          Chain.inject('input.name.value'),
          NamedChain.asChain([
            NamedChain.write('x', Chain.inject(5)),
            NamedChain.write('y', Chain.inject(8)),
            NamedChain.output(NamedChain.inputName())
          ]),
          cIsEqual('input.name.value')
        ])
      ]),

      StepAssertions.testStepsPass({}, [
        Chain.asStep({ }, [
          Chain.inject('input.name.value'),
          NamedChain.asChain([
            NamedChain.write('x', Chain.inject(5)),
            NamedChain.write('y', Chain.inject(8)),
            NamedChain.outputInput
          ]),
          cIsEqual('input.name.value')
        ])
      ]),

      StepAssertions.testStepsFail('z is not a field in the index object.', [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.write('x', Chain.inject(5)),
            NamedChain.write('y', Chain.inject(8)),
            NamedChain.output('z')
          ]),
          cIsEqual(8)
        ])
      ])
    ]))
  ], function () {
    success();
  }, failure);
});

