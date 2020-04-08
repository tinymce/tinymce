import { FieldSchema } from '@ephox/boulder';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import { dataset as datasetState } from './RepresentState';
import { DatasetRepresentingState, DatasetStoreConfig, RepresentingConfig } from './RepresentingTypes';

interface DatasetRepresentingConfig extends RepresentingConfig {
  store: DatasetStoreConfig<any>;
}

const setValue = (component: AlloyComponent, repConfig: DatasetRepresentingConfig, repState: DatasetRepresentingState, data: any) => {
  const store = repConfig.store;
  repState.update([ data ]);
  store.setValue(component, data);
  repConfig.onSetValue(component, data);
};

const getValue = (component: AlloyComponent, repConfig: DatasetRepresentingConfig, repState: DatasetRepresentingState) => {
  const store = repConfig.store;
  const key = store.getDataKey(component);
  return repState.lookup(key).fold(() => store.getFallbackEntry(key), (data) => data);
};

const onLoad = (component: AlloyComponent, repConfig: DatasetRepresentingConfig, repState: DatasetRepresentingState) => {
  const store = repConfig.store;
  store.initialValue.each((data) => {
    setValue(component, repConfig, repState, data);
  });
};

const onUnload = (component: AlloyComponent, repConfig: DatasetRepresentingConfig, repState: DatasetRepresentingState) => {
  repState.clear();
};

export default [
  FieldSchema.option('initialValue'),
  FieldSchema.strict('getFallbackEntry'),
  FieldSchema.strict('getDataKey'),
  FieldSchema.strict('setValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: datasetState
  })
];
