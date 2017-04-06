define(
  'ephox.alloy.test.behaviour.RepresentPipes',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Step',
    'ephox.alloy.api.behaviour.Representing'
  ],

  function (Assertions, Chain, Step, Representing) {
    var cGetValue = Chain.mapper(function (component) {
      return Representing.getValue(component);
    });

    var cSetValue = function (value) {
      return Chain.op(function (component) {
        Representing.setValue(component, value);
      });
    };

    var sSetValue = function (component, value) {
      return Step.sync(function () {
        Representing.setValue(component, value);
      });
    };

    var sAssertValue = function (label, expected, component) {
      return Chain.asStep(component, [
        cGetValue,
        Assertions.cAssertEq(label, expected)
      ]);
    };

    return {
      cGetValue: cGetValue,
      cSetValue: cSetValue,
      sAssertValue: sAssertValue,
      sSetValue: sSetValue
    };
  }
);
