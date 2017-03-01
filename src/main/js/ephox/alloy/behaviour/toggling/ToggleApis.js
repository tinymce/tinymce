define(
  'ephox.alloy.behaviour.toggling.ToggleApis',

  [
    'ephox.sugar.api.properties.Class'
  ],

  function (Class) {
    var updateAriaState = function (component, toggleInfo) {
      var pressed = Class.has(component.element(), toggleInfo.toggleClass());

      var ariaInfo = toggleInfo.aria();
      ariaInfo.update()(component, ariaInfo, pressed);
    };

    var toggle = function (component, toggleInfo) {
      Class.toggle(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var select = function (component, toggleInfo) {
      Class.add(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var deselect = function (component, toggleInfo) {
      Class.remove(component.element(), toggleInfo.toggleClass());
      updateAriaState(component, toggleInfo);
    };

    var isSelected = function (component, toggleInfo) {
      return Class.has(component.element(), toggleInfo.toggleClass());
    };

    var onLoad = function (component, toggleInfo) {
      // There used to be a bit of code in here that would only overwrite
      // the attribute if it didn't have a current value. I can't remember
      // what case that was for, so I'm removing it until it is required.
      var api = toggleInfo.selected() ? select : deselect;
      api(component, toggleInfo);
    };

    return {
      onLoad: onLoad,
      toggle: toggle,
      isSelected: isSelected,
      select: select,
      deselect: deselect
    };
  }
);