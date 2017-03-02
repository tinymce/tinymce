define(
  'ephox.alloy.behaviour.toggling.ToggleApis',

  [
    'ephox.sugar.api.properties.Class'
  ],

  function (Class) {
    var updateAriaState = function (component, toggleInfo) {
      var pressed = isOn(component, toggleInfo);

      var ariaInfo = toggleInfo.aria();
      ariaInfo.update()(component, ariaInfo, pressed);
    };

    var toggle = function (component, toggleInfo) {
      Class.toggle(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var on = function (component, toggleInfo) {
      Class.add(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var off = function (component, toggleInfo) {
      Class.remove(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var isOn = function (component, toggleInfo) {
      return Class.has(component.element(), toggleInfo.toggleClass());
    };

    var onLoad = function (component, toggleInfo) {
      // There used to be a bit of code in here that would only overwrite
      // the attribute if it didn't have a current value. I can't remember
      // what case that was for, so I'm removing it until it is required.
      var api = toggleInfo.selected() ? on : off;
      api(component, toggleInfo);
    };

    return {
      onLoad: onLoad,
      toggle: toggle,
      isOn: isOn,
      on: on,
      off: off
    };
  }
);