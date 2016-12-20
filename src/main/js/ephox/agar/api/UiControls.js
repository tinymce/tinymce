define(
  'ephox.agar.api.UiControls',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.UiFinder',
    'ephox.sugar.api.properties.Value',
    'global!Array'
  ],

  function (Chain, UiFinder, Value, Array) {
    var cSetValue = function (newValue) {
      return Chain.op(function (element) {
        Value.set(element, newValue);
      });
    };

    var cGetValue = Chain.mapper(function (element) {
      return Value.get(element);
    });

    var sSetValue = function (element, newValue) {
      return Chain.asStep(element, [
        cSetValue(newValue)
      ]);
    };

    var sSetValueOn = function (container, selector, newValue) {
      return Chain.asStep(container, [
        UiFinder.cFindIn(selector),
        cSetValue(newValue)
      ]);
    };

    return {
      sSetValueOn: sSetValueOn,
      sSetValue: sSetValue,

      cSetValue: cSetValue,
      cGetValue: cGetValue
    };
  }
);