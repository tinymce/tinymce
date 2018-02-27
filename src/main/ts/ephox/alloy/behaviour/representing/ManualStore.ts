import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import * as NoState from '../common/NoState';

const getValue = function (component, repConfig, repState) {
  return repConfig.store().getValue()(component);
};

const setValue = function (component, repConfig, repState, data) {
  repConfig.store().setValue()(component, data);
  repConfig.onSetValue()(component, data);
};

const onLoad = function (component, repConfig, repState) {
  repConfig.store().initialValue().each(function (data) {
    repConfig.store().setValue()(component, data);
  });
};

export default <any> [
  FieldSchema.strict('getValue'),
  FieldSchema.defaulted('setValue', Fun.noop),
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload: Fun.noop,
    state: NoState.init
  })
];