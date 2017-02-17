define(
  'ephox.alloy.behaviour.disabling.DisableApis',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Node'
  ],

  function (Arr, Attr, Class, Node) {
    // Just use "disabled" attribute for these, not "aria-disabled"
    var nativeDisabled = [
      'input',
      'button',
      'textarea'
    ];

    var onLoad = function (component, disableInfo) {
      if (disableInfo.disabled()) disable(component, disableInfo);
    };

    var hasNative = function (component) {
      return Arr.contains(nativeDisabled, Node.name(component.element()));
    };

    var nativeIsDisabled = function (component) {
      return Attr.has(component.element(), 'disabled');
    };

    var nativeDisable = function (component) {
      Attr.set(component.element(), 'disabled', 'disabled');
    };

    var nativeEnable = function (component) {
      Attr.remove(component.element(), 'disabled');
    };

    var ariaIsDisabled = function (component) {
      return Attr.get(component.element(), 'aria-disabled') === 'true';
    };

    var ariaDisable = function (component) {
      Attr.set(component.element(), 'aria-disabled', 'true');
    };

    var ariaEnable = function (component) {
      Attr.set(component.element(), 'aria-disabled', 'false');
    };

    var disable = function (component, disableInfo) {
      disableInfo.disableClass().each(function (disableClass) {
        Class.add(component.element(), disableClass);
      });
      var f = hasNative(component) ? nativeDisable : ariaDisable;
      f(component);
    };

    var enable = function (component, disableInfo) {
      disableInfo.disableClass().each(function (disableClass) {
        Class.remove(component.element(), disableClass);
      });
      var f = hasNative(component) ? nativeEnable : ariaEnable;
      f(component);
    };

    var isDisabled = function (component) {
      return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
    };

    return {
      enable: enable,
      disable: disable,
      isDisabled: isDisabled,
      onLoad: onLoad
    };
  }
);