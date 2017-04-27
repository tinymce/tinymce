define(
  'tinymce.themes.mobile.test.ui.TestUi',

  [
    'ephox.agar.api.Chain',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Chain, AlloyLogger, Result, Focus, Traverse) {
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

    return {
      cGetFocused: cGetFocused,
      cGetParent: cGetParent
    };
  }
);
