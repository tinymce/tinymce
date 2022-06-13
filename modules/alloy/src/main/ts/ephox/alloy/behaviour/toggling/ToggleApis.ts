import { Class } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { TogglingConfig, TogglingState } from './TogglingTypes';

const updateAriaState = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
  const ariaInfo = toggleConfig.aria;
  ariaInfo.update(component, ariaInfo, toggleState.get());
};

const updateClass = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
  toggleConfig.toggleClass.each((toggleClass: string) => {
    if (toggleState.get()) {
      Class.add(component.element, toggleClass);
    } else {
      Class.remove(component.element, toggleClass);
    }
  });
};

const set = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState, state: boolean): void => {
  const initialState = toggleState.get();

  toggleState.set(state);
  updateClass(component, toggleConfig, toggleState);
  updateAriaState(component, toggleConfig, toggleState);

  if (initialState !== state) {
    toggleConfig.onToggled(component, state);
  }
};

const toggle = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
  set(component, toggleConfig, toggleState, !toggleState.get());
};

const on = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
  set(component, toggleConfig, toggleState, true);
};

const off = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
  set(component, toggleConfig, toggleState, false);
};

const isOn = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): boolean =>
  toggleState.get();

const onLoad = (component: AlloyComponent, toggleConfig: TogglingConfig, toggleState: TogglingState): void => {
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
