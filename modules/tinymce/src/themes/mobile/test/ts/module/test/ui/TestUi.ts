import { Assertions, Chain, Mouse, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { AlloyLogger, AlloyTriggers, Gui, MementoRecord, NativeEvents, Toggling } from '@ephox/alloy';
import { Optional, Result } from '@ephox/katamari';
import { Attribute, Focus, SugarElement, Traverse } from '@ephox/sugar';
import { MobileRealm } from 'tinymce/themes/mobile/ui/IosRealm';

const cGetFocused = Chain.binder(function () {
  return Focus.active().fold(function () {
    return Result.error('Could not find focused element');
  }, Result.value);
});

const cGetParent = Chain.binder(function (elem: SugarElement) {
  return Traverse.parent(elem).fold(function () {
    return Result.error('Could not find parent of ' + AlloyLogger.element(elem));
  }, Result.value);
});

const sSetFieldValue = function (value: string) {
  return Chain.asStep({ }, [
    cGetFocused,
    UiControls.cSetValue(value)
  ]);
};

const sSetFieldOptValue = function (optVal: Optional<string>) {
  return optVal.fold(function () {
    return Step.pass;
  }, sSetFieldValue);
};

const sStartEditor = function (alloy: Gui.GuiSystem) {
  return Step.sync(function () {
    const button = UiFinder.findIn(alloy.element, '[role="button"]').getOrDie();
    const x = alloy.getByDom(button).getOrDie();
    AlloyTriggers.emit(x, NativeEvents.click());
  });
};

const sClickComponent = function (realm: MobileRealm, memento: MementoRecord) {
  return Chain.asStep({ }, [
    Chain.injectThunked(function () {
      return memento.get(realm.socket).element;
    }),
    Mouse.cClick
  ]);
};

const sWaitForToggledState = function (label: string, state: boolean, realm: MobileRealm, memento: MementoRecord) {
  return Waiter.sTryUntil(
    label,
    Step.sync(function () {
      const component = memento.get(realm.socket);
      Assertions.assertEq(
        'Selected/Pressed state of component: (' + Attribute.get(component.element, 'class') + ')',
        state,
        Toggling.isOn(component)
      );
    }),
    100,
    8000
  );
};

const sBroadcastState = function (realm: MobileRealm, channels: string[], command: string, state: boolean) {
  return Step.sync(function () {
    realm.system.broadcastOn(channels, {
      command,
      state
    });
  });
};

export {
  cGetFocused,
  cGetParent,
  sSetFieldValue,
  sSetFieldOptValue,

  sWaitForToggledState,
  sClickComponent,
  sStartEditor,

  sBroadcastState
};
