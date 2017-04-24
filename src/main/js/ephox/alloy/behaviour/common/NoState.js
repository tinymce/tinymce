define(
  'ephox.alloy.behaviour.common.NoState',

  [
    'ephox.alloy.behaviour.common.BehaviourState',
    'global!Math'
  ],

  function (BehaviourState, Math) {
    var init = function () {
      return BehaviourState({
        readState: function () {
          return 'No State required';
        }
      });
    };

    return {
      init: init
    };
  }
);
