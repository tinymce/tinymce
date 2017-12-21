import NoState from '../common/NoState';
import Fields from '../../data/Fields';
import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

var getValue = function (component, repConfig, repState) {
  return repConfig.store().getValue()(component);
};

var setValue = function (component, repConfig, repState, data) {
  repConfig.store().setValue()(component, data);
  repConfig.onSetValue()(component, data);
};

var onLoad = function (component, repConfig, repState) {
  repConfig.store().initialValue().each(function (data) {
    repConfig.store().setValue()(component, data);
  });
};

export default <any> [
  FieldSchema.strict('getValue'),
  FieldSchema.defaulted('setValue', Fun.noop),
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue: setValue,
    getValue: getValue,
    onLoad: onLoad,
    onUnload: Fun.noop,
    state: NoState.init
  })
];