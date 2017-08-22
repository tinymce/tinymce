define(
  'tinymce.themes.mobile.test.ui.TestUi',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Assertions, Chain, Mouse, Step, UiControls, UiFinder, Toggling, AlloyTriggers, NativeEvents, AlloyLogger, Result, Focus, Traverse) {
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

    var sTogglingIs = function (alloy, selector, state) {
      return Step.sync(function () {
        var comp = UiFinder.findIn(alloy.element(), selector).bind(function (el) {
          return alloy.getByDom(el);
        }).getOrDie();
        Assertions.assertEq('Checking toggling of ' + AlloyLogger.element(comp.element()), state, Toggling.isOn(comp));
      });
    };

    var sStartEditor = function (alloy) {
      return Step.sync(function () {
        var button = UiFinder.findIn(alloy.element(), '[role="button"]').getOrDie();
        var x = alloy.getByDom(button).getOrDie();
        AlloyTriggers.emit(x, NativeEvents.click());
      });
    };

    var sClickComponent = function (realm, memento) {
      return Chain.asStep({ }, [
        Chain.mapper(function () {
          return memento.get(realm.socket()).element();
        }),
        Mouse.cClick
      ]);
    };

    return {
      cGetFocused: cGetFocused,
      cGetParent: cGetParent,
      sSetFieldValue: sSetFieldValue,
      sSetFieldOptValue: sSetFieldOptValue,

      sTogglingIs: sTogglingIs,
      sClickComponent: sClickComponent,
      sStartEditor: sStartEditor
    };
  }
);
