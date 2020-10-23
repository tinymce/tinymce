import { FieldSchema } from '@ephox/boulder';
import { AlloyComponent } from '../../api/component/ComponentApi';

import * as Fields from '../../data/Fields';
import { memory } from './RepresentState';
import { MemoryRepresentingState, MemoryStoreConfig, RepresentingConfig } from './RepresentingTypes';

interface MemoryRepresentingConfig extends RepresentingConfig {
  store: MemoryStoreConfig;
}

const setValue = (component: AlloyComponent, repConfig: MemoryRepresentingConfig, repState: MemoryRepresentingState, data: any) => {
  repState.set(data);
  repConfig.onSetValue(component, data);
};

const getValue = (component: AlloyComponent, repConfig: MemoryRepresentingConfig, repState: MemoryRepresentingState) => repState.get();

const onLoad = (component: AlloyComponent, repConfig: MemoryRepresentingConfig, repState: MemoryRepresentingState) => {
  repConfig.store.initialValue.each((initVal) => {
    if (repState.isNotSet()) { repState.set(initVal); }
  });
};

const onUnload = (component: AlloyComponent, repConfig: MemoryRepresentingConfig, repState: MemoryRepresentingState) => {
  repState.clear();
};

export default [
  FieldSchema.option('initialValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: memory
  })
];
