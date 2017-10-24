asynctest(
  'NamedChainTest',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.test.StepAssertions',
    'ephox.katamari.api.Result'
  ],

  function (Chain, NamedChain, Pipeline, RawAssertions, StepAssertions, Result) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

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

    Pipeline.async({}, [
      StepAssertions.testStepsPass({

      }, [
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

            NamedChain.bundle(function (input) {
              RawAssertions.assertEq('Checking bundled chain output', {
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
              }, input);
              return Result.value(input);
            })
          ])
        ])
      ])
    ], function () {
      success();
    }, failure);
  }
);