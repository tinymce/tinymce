import { Class } from '@ephox/sugar';

const updateAriaState = function (component, toggleConfig) {
  const pressed = isOn(component, toggleConfig);

  const ariaInfo = toggleConfig.aria();
  ariaInfo.update()(component, ariaInfo, pressed);
};

const toggle = function (component, toggleConfig, toggleState) {
  Class.toggle(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

const on = function (component, toggleConfig, toggleState) {
  Class.add(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

const off = function (component, toggleConfig, toggleState) {
  Class.remove(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

const isOn = function (component, toggleConfig) {
  return Class.has(component.element(), toggleConfig.toggleClass());
};

const onLoad = function (component, toggleConfig, toggleState) {
  // There used to be a bit of code in here that would only overwrite
  // the attribute if it didn't have a current value. I can't remember
  // what case that was for, so I'm removing it until it is required.
  const api = toggleConfig.selected() ? on : off;
  api(component, toggleConfig, toggleState);
};

export {
  onLoad,
  toggle,
  isOn,
  on,
  off
};