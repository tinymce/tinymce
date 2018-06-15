import { FieldSchema, Objects } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import * as RepresentState from './RepresentState';

const setValue = (component, repConfig, repState, data) => {
  // TODO FIX: Rewrite this mode. I don't think it makes any sense.
  const dataKey = repConfig.store().getDataKey();
  repState.set({ });
  repConfig.store().setData()(component, data);
  repConfig.onSetValue()(component, data);
};

const getValue = (component, repConfig, repState) => {
  const key = repConfig.store().getDataKey()(component);
  const dataset = repState.get();
  return Objects.readOptFrom(dataset, key).fold(() => {
    return repConfig.store().getFallbackEntry()(key);
  }, (data) => {
    return data;
  });
};

const onLoad = (component, repConfig, repState) => {
  repConfig.store().initialValue().each((data) => {
    setValue(component, repConfig, repState, data);
  });
};

const onUnload = (component, repConfig, repState) => {
  repState.set({ });
};

export default <any> [
  FieldSchema.option('initialValue'),
  FieldSchema.strict('getFallbackEntry'),
  FieldSchema.strict('getDataKey'),
  FieldSchema.strict('setData'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: RepresentState.dataset
  })
];