define(
  'ephox.alloy.behaviour.invalidating.ActiveInvalidate',

  [
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (InvalidateApis, EventHandler, Objects) {
    var events = function (invalidInfo) {
      return invalidInfo.validator().map(function (validatorInfo) {
        return Objects.wrap(
          validatorInfo.onEvent(),
          EventHandler.nu({
            run: function (component) {
              invalidInfo.notify().each(function (notifyInfo) {
                notifyInfo.onValidate()(component);
              });

              validatorInfo.validate()(component).get(function (valid) {
                valid.fold(function (err) {
                  InvalidateApis.markInvalid(component, invalidInfo, err);
                }, function () {
                  InvalidateApis.markValid(component, invalidInfo);
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