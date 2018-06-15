import { Cell } from '@ephox/katamari';

import BehaviourState from '../common/BehaviourState';

const memory = () => {
  const data = Cell(null);

  const readState = () => {
    return {
      mode: 'memory',
      value: data.get()
    };
  };

  const isNotSet = () => {
    return data.get() === null;
  };

  const clear = () => {
    data.set(null);
  };

  return BehaviourState({
    set: data.set,
    get: data.get,
    isNotSet,
    clear,
    readState
  });
};

const manual = () => {
  const readState = () => {

  };

  return BehaviourState({
    readState
  });
};

const dataset = () => {
  const data = Cell({ });

  const readState = () => {
    return {
      mode: 'dataset',
      dataset: data.get()
    };
  };

  return BehaviourState({
    readState,
    set: data.set,
    get: data.get
  });
};

const init = (spec) => {
  return spec.store().manager().state(spec);
};

export {
  memory,
  dataset,
  manual,

  init
};