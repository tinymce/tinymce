define(
  'ephox.alloy.behaviour.invalidating.ActiveInvalidate',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.katamari.api.Fun'
  ],

  function (AlloyEvents, InvalidateApis, Fun) {
    var events = function (invalidConfig, invalidState) {
      return invalidConfig.validator().map(function (validatorInfo) {
        return AlloyEvents.derive([
          AlloyEvents.run(validatorInfo.onEvent(), function (component) {
            InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.identity);
          })
        ].concat(validatorInfo.validateOnLoad() ? [
          AlloyEvents.runOnAttached(function (component) {
            InvalidateApis.run(component, invalidConfig, invalidState).get(Fun.noop);
          })
        ] : [ ]));
      }).getOr({ });
    };

    return {
      events: events
    };
  }
);