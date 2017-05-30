define(
  'ephox.alloy.behaviour.invalidating.ActiveInvalidate',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.behaviour.invalidating.InvalidateApis'
  ],

  function (AlloyEvents, InvalidateApis) {
    var events = function (invalidConfig, invalidState) {
      return invalidConfig.validator().map(function (validatorInfo) {
        return AlloyEvents.derive([
          AlloyEvents.run(validatorInfo.onEvent(), function (component) {
            invalidConfig.notify().each(function (notifyInfo) {
              notifyInfo.onValidate()(component);
            });

            validatorInfo.validate()(component).get(function (valid) {
              valid.fold(function (err) {
                InvalidateApis.markInvalid(component, invalidConfig, invalidState, err);
              }, function () {
                InvalidateApis.markValid(component, invalidConfig, invalidState);
              });
            });
          })
        ]);
      }).getOr({ });
    };

    return {
      events: events
    };
  }
);