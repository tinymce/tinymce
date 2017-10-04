define(
  'tinymce.themes.mobile.test.ui.TestUi',

  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Mouse',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiControls',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.log.AlloyLogger',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.Traverse',
    'tinymce.themes.mobile.channels.TinyChannels'
  ],

  function (Assertions, Chain, Mouse, Step, UiControls, UiFinder, Waiter, Toggling, AlloyTriggers, NativeEvents, AlloyLogger, Result, Focus, Attr, Traverse, TinyChannels) {
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

    var sWaitForToggledState = function (label, state, realm, memento) {
      return Waiter.sTryUntil(
        label,
        Step.sync(function () {
          var component = memento.get(realm.socket());
          Assertions.assertEq(
            'Selected/Pressed state of component: (' + Attr.get(component.element(), 'class') + ')',
            state,
            Toggling.isOn(component)
          );
        }),
        100,
        1000
      );
    };

    var sBroadcastState = function (realm, channels, command, state) {
      return Step.sync(function () {
        realm.system().broadcastOn(channels, {
          command: command,
          state: state
        });
      });
    };

    return {
      cGetFocused: cGetFocused,
      cGetParent: cGetParent,
      sSetFieldValue: sSetFieldValue,
      sSetFieldOptValue: sSetFieldOptValue,

      sWaitForToggledState: sWaitForToggledState,
      sClickComponent: sClickComponent,
      sStartEditor: sStartEditor,

      sBroadcastState: sBroadcastState
    };
  }
);
