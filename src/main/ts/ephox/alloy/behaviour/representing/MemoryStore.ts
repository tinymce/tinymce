import { FieldSchema } from '@ephox/boulder';

import Fields from '../../data/Fields';
import RepresentState from './RepresentState';

const setValue = function (component, repConfig, repState, data) {
  repState.set(data);
  repConfig.onSetValue()(component, data);
};

const getValue = function (component, repConfig, repState) {
  return repState.get();
};

const onLoad = function (component, repConfig, repState) {
  repConfig.store().initialValue().each(function (initVal) {
    if (repState.isNotSet()) { repState.set(initVal); }
  });
};

const onUnload = function (component, repConfig, repState) {
  repState.clear();
};

export default <any> [
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: RepresentState.memory
  })
];