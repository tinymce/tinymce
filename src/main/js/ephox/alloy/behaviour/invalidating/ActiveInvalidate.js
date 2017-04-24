define(
  'ephox.alloy.behaviour.invalidating.ActiveInvalidate',

  [
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (InvalidateApis, EventHandler, Objects) {
    var events = function (invalidConfig/*, invalidState */) {
      return invalidConfig.validator().map(function (validatorInfo) {
        return Objects.wrap(
          validatorInfo.onEvent(),
          EventHandler.nu({
            run: function (component) {
              invalidConfig.notify().each(function (notifyInfo) {
                notifyInfo.onValidate()(component);
              });

              validatorInfo.validate()(component).get(function (valid) {
                valid.fold(function (err) {
                  InvalidateApis.markInvalid(component, invalidConfig, err);
                }, function () {
                  InvalidateApis.markValid(component, invalidConfig);
                });
              });
            }
          })
        );
      }).getOr({ });
    };

    return {
      events: events
    };
  }
);