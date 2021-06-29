import { Assertions, Chain, Mouse, Step, UiControls, UiFinder, Waiter } from '@ephox/agar';
import { AlloyLogger, AlloyTriggers, Gui, MementoRecord, NativeEvents, Toggling } from '@ephox/alloy';
import { Optional, Result } from '@ephox/katamari';
import { Attribute, Focus, SugarElement, Traverse } from '@ephox/sugar';

import { MobileRealm } from 'tinymce/themes/mobile/ui/IosRealm';

const cGetFocused = Chain.binder(() => {
  return Focus.active().fold(() => {
    return Result.error<SugarElement<HTMLElement>, string>('Could not find focused element');
  }, Result.value);
});

const cGetParent = Chain.binder((elem: SugarElement) => {
  return Traverse.parent(elem).fold(() => {
    return Result.error<SugarElement<Node & ParentNode>, string>('Could not find parent of ' + AlloyLogger.element(elem));
  }, Result.value);
});

const sSetFieldValue = (value: string) => {
  return Chain.asStep({ }, [
    cGetFocused,
    UiControls.cSetValue(value)
  ]);
};

const sSetFieldOptValue = (optVal: Optional<string>) => {
  return optVal.fold(() => {
    return Step.pass;
  }, sSetFieldValue);
};

const sStartEditor = (alloy: Gui.GuiSystem) => {
  return Step.sync(() => {
    const button = UiFinder.findIn(alloy.element, '[role="button"]').getOrDie();
    const x = alloy.getByDom(button).getOrDie();
    AlloyTriggers.emit(x, NativeEvents.click());
  });
};

const sClickComponent = (realm: MobileRealm, memento: MementoRecord) => {
  return Chain.asStep({ }, [
    Chain.injectThunked(() => {
      return memento.get(realm.socket).element;
    }),
    Mouse.cClick
  ]);
};

const sWaitForToggledState = (label: string, state: boolean, realm: MobileRealm, memento: MementoRecord) => {
  return Waiter.sTryUntil(
    label,
    Step.sync(() => {
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

const sBroadcastState = (realm: MobileRealm, channels: string[], command: string, state: boolean) => {
  return Step.sync(() => {
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
