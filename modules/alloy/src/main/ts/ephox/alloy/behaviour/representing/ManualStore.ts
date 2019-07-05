import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import * as Fields from '../../data/Fields';
import { NoState } from '../common/BehaviourState';

const getValue = (component, repConfig, repState) => {
  return repConfig.store.getValue(component);
};

const setValue = (component, repConfig, repState, data) => {
  repConfig.store.setValue(component, data);
  repConfig.onSetValue(component, data);
};

const onLoad = (component, repConfig, repState) => {
  repConfig.store.initialValue.each((data) => {
    repConfig.store.setValue(component, data);
  });
};

export default [
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
