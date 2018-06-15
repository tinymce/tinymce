import { FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import * as RepresentState from './RepresentState';

const setValue = (component, repConfig, repState, data) => {
  repState.set(data);
  repConfig.onSetValue()(component, data);
};

const getValue = (component, repConfig, repState) => {
  return repState.get();
};

const onLoad = (component, repConfig, repState) => {
  repConfig.store().initialValue().each((initVal) => {
    if (repState.isNotSet()) { repState.set(initVal); }
  });
};

const onUnload = (component, repConfig, repState) => {
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