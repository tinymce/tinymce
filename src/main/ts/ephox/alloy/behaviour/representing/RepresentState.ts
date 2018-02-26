import { Cell } from '@ephox/katamari';

import BehaviourState from '../common/BehaviourState';

const memory = function () {
  const data = Cell(null);

  const readState = function () {
    return {
      mode: 'memory',
      value: data.get()
    };
  };

  const isNotSet = function () {
    return data.get() === null;
  };

  const clear = function () {
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

const manual = function () {
  const readState = function () {

  };

  return BehaviourState({
    readState
  });
};

const dataset = function () {
  const data = Cell({ });

  const readState = function () {
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

const init = function (spec) {
  return spec.store().manager().state(spec);
};

export {
  memory,
  dataset,
  manual,

  init
};