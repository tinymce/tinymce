test(
  'CustomDefinitionTest',

  [
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.test.ResultAssertions'
  ],

  function (CustomDefinition, ResultAssertions) {
    var checkErr = function (label, expectedPart, spec) {
      ResultAssertions.checkErr(
        label,
        expectedPart,
        function () {
          return CustomDefinition.toInfo(spec);
        }
      );
    };

    checkErr('Empty object', '*strict* value for "dom"', {});
  }
);