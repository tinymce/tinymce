import BehaviourState from '../common/BehaviourState';
import { Cell } from '@ephox/katamari';

var memory = function () {
  var data = Cell(null);

  var readState = function () {
    return {
      mode: 'memory',
      value: data.get()
    };
  };

  var isNotSet = function () {
    return data.get() === null;
  };

  var clear = function () {
    data.set(null);
  };

  return BehaviourState({
    set: data.set,
    get: data.get,
    isNotSet: isNotSet,
    clear: clear,
    readState: readState
  });
};

var manual = function () {
  var readState = function () {

  };

  return BehaviourState({
    readState: readState
  });
};

var dataset = function () {
  var data = Cell({ });

  var readState = function () {
    return {
      mode: 'dataset',
      dataset: data.get()
    };
  };

  return BehaviourState({
    readState: readState,
    set: data.set,
    get: data.get
  });
};

var init = function (spec) {
  return spec.store().manager().state(spec);
};

export default <any> {
  memory: memory,
  dataset: dataset,
  manual: manual,

  init: init
};