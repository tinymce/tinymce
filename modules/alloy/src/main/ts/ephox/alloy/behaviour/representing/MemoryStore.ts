import { FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import * as RepresentState from './RepresentState';
import { RepresentingConfig } from './RepresentingTypes';

// TODO: Fix types
const setValue = (component, repConfig: any, repState, data) => {
  repState.set(data);
  repConfig.onSetValue(component, data);
};

const getValue = (component, repConfig: RepresentingConfig, repState) => {
  return repState.get();
};

// TODO: Introduce types. Complicated by repConfig's structure
const onLoad = (component, repConfig: any, repState) => {
  repConfig.store.initialValue.each((initVal) => {
    if (repState.isNotSet()) { repState.set(initVal); }
  });
};

const onUnload = (component, repConfig, repState) => {
  repState.clear();
};

export default [
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: RepresentState.memory
  })
];
