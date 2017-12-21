import { Class } from '@ephox/sugar';

var updateAriaState = function (component, toggleConfig) {
  var pressed = isOn(component, toggleConfig);

  var ariaInfo = toggleConfig.aria();
  ariaInfo.update()(component, ariaInfo, pressed);
};

var toggle = function (component, toggleConfig, toggleState) {
  Class.toggle(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

var on = function (component, toggleConfig, toggleState) {
  Class.add(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

var off = function (component, toggleConfig, toggleState) {
  Class.remove(component.element(), toggleConfig.toggleClass());
  updateAriaState(component, toggleConfig);
};

var isOn = function (component, toggleConfig) {
  return Class.has(component.element(), toggleConfig.toggleClass());
};

var onLoad = function (component, toggleConfig, toggleState) {
  // There used to be a bit of code in here that would only overwrite
  // the attribute if it didn't have a current value. I can't remember
  // what case that was for, so I'm removing it until it is required.
  var api = toggleConfig.selected() ? on : off;
  api(component, toggleConfig, toggleState);
};

export default <any> {
  onLoad: onLoad,
  toggle: toggle,
  isOn: isOn,
  on: on,
  off: off
};