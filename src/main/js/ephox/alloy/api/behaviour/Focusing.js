define(
  'ephox.alloy.api.behaviour.Focusing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.sugar.api.Focus'
  ],

  function (BehaviourExport, Focus) {
    return BehaviourExport.build(
      'focusing',
      [
        'focus',
        'blur',
        'isFocused'
      ],
      {
        isFocused: function (component) {
          // Dupe wth Focusing.
          return Focus.hasFocus(component.element());
        }
      }
    );
  }
);