import { Cell } from '@ephox/katamari';

import { BehaviourState, nuState } from '../common/BehaviourState';

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

  return nuState({
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

  return nuState({
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

  return nuState({
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