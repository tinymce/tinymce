define(
  'ephox.echo.api.AriaDrop',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    var grab = function (element, bool) {
      Attr.set(element, 'aria-grabbed', bool);
    };

    // http://www.w3.org/TR/wai-aria/states_and_properties#aria-dropeffect
    var effect = function (element, operation) {
      Attr.set(element, 'aria-dropeffect', operation);
    };

    return {
      grab: grab,
      effect: effect
    };
  }
);