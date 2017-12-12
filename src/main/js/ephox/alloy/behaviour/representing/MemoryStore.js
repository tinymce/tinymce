import RepresentState from './RepresentState';
import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';

var setValue = function (component, repConfig, repState, data) {
  repState.set(data);
  repConfig.onSetValue()(component, data);
};

var getValue = function (component, repConfig, repState) {
  return repState.get();
};

var onLoad = function (component, repConfig, repState) {
  repConfig.store().initialValue().each(function (initVal) {
    if (repState.isNotSet()) repState.set(initVal);
  });
};

var onUnload = function (component, repConfig, repState) {
  repState.clear();
};

export default <any> [
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue: setValue,
    getValue: getValue,
    onLoad: onLoad,
    onUnload: onUnload,
    state: RepresentState.memory
  })
];