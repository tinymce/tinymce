define(
  'ephox.alloy.behaviour.sliding.SlidingState',

  [
    'ephox.alloy.behaviour.common.BehaviourState',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (BehaviourState, Cell, Fun) {
    var init = function (spec) {
      var state = Cell(spec.expanded());

      var readState = function () {
        return 'expanded: ' + state.get();
      };

      return BehaviourState({
        isExpanded: function () { return state.get() === true; },
        isCollapsed: function () { return state.get() === false; },
        setCollapsed: Fun.curry(state.set, false),
        setExpanded: Fun.curry(state.set, true),
        readState: readState
      });
    };

    return {
      init: init
    };
  }
);
