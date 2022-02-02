import { FieldSchema } from '@ephox/boulder';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import { DatasetRepresentingState, DatasetStoreConfig, RepresentingConfig } from './RepresentingTypes';
import { dataset as datasetState } from './RepresentState';

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
  return repState.lookup(key).getOrThunk(() => store.getFallbackEntry(key));
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
  FieldSchema.required('getFallbackEntry'),
  FieldSchema.required('getDataKey'),
  FieldSchema.required('setValue'),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: datasetState
  })
];
