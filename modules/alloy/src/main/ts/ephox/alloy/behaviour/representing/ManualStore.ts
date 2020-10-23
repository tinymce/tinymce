import { FieldSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import { NoState } from '../common/BehaviourState';
import { ManualRepresentingState, ManualStoreConfig, RepresentingConfig } from './RepresentingTypes';

interface ManualRepresentingConfig extends RepresentingConfig {
  store: ManualStoreConfig;
}

const getValue = (component: AlloyComponent, repConfig: ManualRepresentingConfig, _repState: ManualRepresentingState) => repConfig.store.getValue(component);

const setValue = (component: AlloyComponent, repConfig: ManualRepresentingConfig, _repState: ManualRepresentingState, data: any) => {
  repConfig.store.setValue(component, data);
  repConfig.onSetValue(component, data);
};

const onLoad = (component: AlloyComponent, repConfig: ManualRepresentingConfig, _repState: ManualRepresentingState) => {
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
