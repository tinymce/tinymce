define(
  'ephox.alloy.behaviour.invalidating.InvalidateApis',

  [
    'ephox.alloy.alien.AriaVoice',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Html'
  ],

  function (AriaVoice, Body, Class, Html) {
    var markValid = function (component, invalidInfo) {
      Class.remove(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().bind(function (notifyInfo) {
        notifyInfo.getContainer()(component).each(function (container) {
          Html.set(container, notifyInfo.validHtml());
        });

        notifyInfo.onValid()(component);
      });
    };

    var markInvalid = function (component, invalidInfo, text) {
      Class.add(component.element(), invalidInfo.invalidClass());
      invalidInfo.notify().each(function (notifyInfo) {
        // Probably want to make "Body" configurable as well.
        AriaVoice.shout(Body.body(), text);
        notifyInfo.getContainer()(component).each(function (container) {
          // TODO: Should we just use Text here, not HTML?
          Html.set(container, text);
        });

        notifyInfo.onInvalid()(component, text);
      });
    };

    return {
      markValid: markValid,
      markInvalid: markInvalid
    };
  }
);