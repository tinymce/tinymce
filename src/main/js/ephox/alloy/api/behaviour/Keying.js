define(
  'ephox.alloy.api.behaviour.Keying',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.keyboard.KeyboardBranches',
    'ephox.alloy.behaviour.keyboard.KeyingState',
    'ephox.boulder.api.Objects',
    'global!console'
  ],

  function (Behaviour, KeyboardBranches, KeyingState, Objects, console) {
    // These APIs are going to be interesting because they are not
    // available for all keying modes
    return Behaviour.createModes({
      branchKey: 'mode',
      branches: KeyboardBranches,
      name: 'keying',
      active: {
        events: function (keyingConfig, keyingState) {
          var handler = keyingConfig.handler();
          return handler.toEvents(keyingConfig, keyingState);
        }
      },
      apis: {
        focusIn: function (component/*, keyConfig, keyState */) {
          component.getSystem().triggerFocus(component.element(), component.element());
        },

        // These APIs are going to be interesting because they are not
        // available for all keying modes
        setGridSize: function (component, keyConfig, keyState, numRows, numColumns) {
          if (! Objects.hasKey(keyState, 'setGridSize')) {
            console.error('Layout does not support setGridSize');
          } else {
            keyState.setGridSize(numRows, numColumns);
          }
        }
      },
      state: KeyingState
    });
  }
);