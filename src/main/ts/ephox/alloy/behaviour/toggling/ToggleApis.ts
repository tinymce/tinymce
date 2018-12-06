import { Class, Element } from '@ephox/sugar';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { TogglingConfig, TogglingState } from '../../behaviour/toggling/TogglingTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';

const updateAriaState = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  const ariaInfo = toggleConfig.aria;
  ariaInfo.update(component, ariaInfo, toggleState.get());
};

const updateClass = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  toggleConfig.toggleClass.each((toggleClass: string) => {
    if (toggleState.get()) {
      Class.add(component.element(), toggleClass);
    } else {
      Class.remove(component.element(), toggleClass);
    }
  });
};

const toggle = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  set(component, toggleConfig, toggleState, !toggleState.get())
};

const on = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  toggleState.set(true);
  updateClass(component, toggleConfig, toggleState);
  updateAriaState(component, toggleConfig, toggleState);
};

const off = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  toggleState.set(false);
  updateClass(component, toggleConfig, toggleState);
  updateAriaState(component, toggleConfig, toggleState);
};

const set = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState, state: boolean) => {
  const action = state ? on : off;
  action(component, toggleConfig, toggleState);
};

const isOn = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  return toggleState.get();
};

const onLoad = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState) => {
  // There used to be a bit of code in here that would only overwrite
  // the attribute if it didn't have a current value. I can't remember
  // what case that was for, so I'm removing it until it is required.
  set(component, toggleConfig, toggleState, toggleConfig.selected);
};

export {
  onLoad,
  toggle,
  isOn,
  on,
  off,
  set
};