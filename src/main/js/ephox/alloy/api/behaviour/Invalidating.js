define(
  'ephox.alloy.api.behaviour.Invalidating',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.behaviour.invalidating.ActiveInvalidate',
    'ephox.alloy.behaviour.invalidating.InvalidateApis',
    'ephox.alloy.behaviour.invalidating.InvalidateSchema',
    'ephox.katamari.api.Future'
  ],

  function (Behaviour, Representing, ActiveInvalidate, InvalidateApis, InvalidateSchema, Future) {
    return Behaviour.create({
      fields: InvalidateSchema,
      name: 'invalidating',
      active: ActiveInvalidate,
      apis: InvalidateApis,

      extra: {
        // Note, this requires representing to be on the validatee
        validation: function (validator) {
          return function (component) {
            var v = Representing.getValue(component);
            return Future.pure(validator(v));
          };
        }
      }
    });
  }
);