import { Cell, Fun } from '@ephox/katamari';

import BehaviourState from '../common/BehaviourState';

const init = function (spec) {
  const state = Cell(spec.expanded());

  const readState = function () {
    return 'expanded: ' + state.get();
  };

  return BehaviourState({
    isExpanded () { return state.get() === true; },
    isCollapsed () { return state.get() === false; },
    setCollapsed: Fun.curry(state.set, false),
    setExpanded: Fun.curry(state.set, true),
    readState
  });
};

export {
  init
};