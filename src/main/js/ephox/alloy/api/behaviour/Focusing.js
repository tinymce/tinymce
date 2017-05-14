define(
  'ephox.alloy.api.behaviour.Focusing',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.focusing.ActiveFocus',
    'ephox.alloy.behaviour.focusing.FocusApis',
    'ephox.alloy.behaviour.focusing.FocusSchema'
  ],

  function (Behaviour, ActiveFocus, FocusApis, FocusSchema) {
    return Behaviour.create({
      fields: FocusSchema,
      name: 'focusing',
      active: ActiveFocus,
      apis: FocusApis
      // Consider adding isFocused an an extra
    });
  }
);