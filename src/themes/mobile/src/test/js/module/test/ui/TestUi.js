define(
  'tinymce.themes.mobile.test.ui.TestUi',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Chain, Step, UiControls, AlloyLogger, Result, Focus, Traverse) {
    var cGetFocused = Chain.binder(function () {
      return Focus.active().fold(function () {
        return Result.error('Could not find focused element');
      }, Result.value);
    });

    var cGetParent = Chain.binder(function (elem) {
      return Traverse.parent(elem).fold(function () {
        return Result.error('Could not find parent of ' + AlloyLogger.element(elem));
      }, Result.value);
    });

    var sSetFieldValue = function (value) {
      return Chain.asStep({ }, [
        cGetFocused,
        UiControls.cSetValue(value)
      ]);
    };

    var sSetFieldOptValue = function (optVal) {
      return optVal.fold(function () {
        return Step.pass;
      }, sSetFieldValue);
    };

    return {
      cGetFocused: cGetFocused,
      cGetParent: cGetParent,
      sSetFieldValue: sSetFieldValue,
      sSetFieldOptValue: sSetFieldOptValue
    };
  }
);
