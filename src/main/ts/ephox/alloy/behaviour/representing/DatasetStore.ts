import { FieldSchema, Objects } from '@ephox/boulder';

import * as Fields from '../../data/Fields';
import * as RepresentState from './RepresentState';

const setValue = function (component, repConfig, repState, data) {
  // TODO: Really rethink this mode.
  const dataKey = repConfig.store().getDataKey();
  repState.set({ });
  repConfig.store().setData()(component, data);
  repConfig.onSetValue()(component, data);
};

const getValue = function (component, repConfig, repState) {
  const key = repConfig.store().getDataKey()(component);
  const dataset = repState.get();
  return Objects.readOptFrom(dataset, key).fold(function () {
    return repConfig.store().getFallbackEntry()(key);
  }, function (data) {
    return data;
  });
};

const onLoad = function (component, repConfig, repState) {
  repConfig.store().initialValue().each(function (data) {
    setValue(component, repConfig, repState, data);
  });
};

const onUnload = function (component, repConfig, repState) {
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