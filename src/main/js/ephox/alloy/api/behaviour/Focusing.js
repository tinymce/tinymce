define(
  'ephox.alloy.api.behaviour.Focusing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.focusing.ActiveFocus',
    'ephox.alloy.behaviour.focusing.FocusApis',
    'ephox.alloy.behaviour.focusing.FocusSchema'
  ],

  function (BehaviourExport, ActiveFocus, FocusApis, FocusSchema) {
    return BehaviourExport.santa(
      FocusSchema,
      'focusing',
      ActiveFocus,
      FocusApis,
      {
        // May need this.
        // isFocused: function (component) {
        //   // Dupe wth Focusing.
        //   return Focus.hasFocus(component.element());
        // }
      }
    );
  }
);