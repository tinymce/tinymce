import BehaviourState from '../common/BehaviourState';
import { Cell } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

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

export default <any> {
  init: init
};