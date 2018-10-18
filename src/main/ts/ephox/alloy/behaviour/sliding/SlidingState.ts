import { Cell, Fun } from '@ephox/katamari';

import { BehaviourState, nuState } from '../common/BehaviourState';

const init = (spec) => {
  const state = Cell(spec.expanded);

  const readState = () => {
    return 'expanded: ' + state.get();
  };

  return nuState({
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