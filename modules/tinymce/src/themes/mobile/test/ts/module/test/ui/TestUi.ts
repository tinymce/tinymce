import { Assertions, Chain, Mouse, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { AlloyLogger, AlloyTriggers, NativeEvents, Toggling } from '@ephox/alloy';
import { Result } from '@ephox/katamari';
import { Attr, Focus, Traverse, Element } from '@ephox/sugar';

const cGetFocused = Chain.binder(function () {
  return Focus.active().fold(function () {
    return Result.error('Could not find focused element');
  }, Result.value);
});

const cGetParent = Chain.binder(function (elem: Element) {
  return Traverse.parent(elem).fold(function () {
    return Result.error('Could not find parent of ' + AlloyLogger.element(elem));
  }, Result.value);
});

const sSetFieldValue = function (value) {
  return Chain.asStep({ }, [
    cGetFocused,
    UiControls.cSetValue(value)
  ]);
};

const sSetFieldOptValue = function (optVal) {
  return optVal.fold(function () {
    return Step.pass;
  }, sSetFieldValue);
};

const sStartEditor = function (alloy) {
  return Step.sync(function () {
    const button = UiFinder.findIn(alloy.element(), '[role="button"]').getOrDie();
    const x = alloy.getByDom(button).getOrDie();
    AlloyTriggers.emit(x, NativeEvents.click());
  });
};

const sClickComponent = function (realm, memento) {
  return Chain.asStep({ }, [
    Chain.injectThunked(function () {
      return memento.get(realm.socket()).element();
    }),
    Mouse.cClick
  ]);
};

const sWaitForToggledState = function (label, state, realm, memento) {
  return Waiter.sTryUntil(
    label,
    Step.sync(function () {
      const component = memento.get(realm.socket());
      Assertions.assertEq(
        'Selected/Pressed state of component: (' + Attr.get(component.element(), 'class') + ')',
        state,
        Toggling.isOn(component)
      );
    }),
    100,
    8000
  );
};

const sBroadcastState = function (realm, channels, command, state) {
  return Step.sync(function () {
    realm.system().broadcastOn(channels, {
      command,
      state
    });
  });
};

export default {
  cGetFocused,
  cGetParent,
  sSetFieldValue,
  sSetFieldOptValue,

  sWaitForToggledState,
  sClickComponent,
  sStartEditor,

  sBroadcastState
};
