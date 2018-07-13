import { FieldSchema } from '@ephox/boulder';

import { DatasetStoreConfig } from '../../behaviour/representing/RepresentingTypes';
import * as Fields from '../../data/Fields';
import { dataset as datasetState, DatasetRepresentingState } from './RepresentState';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const setValue = (component: AlloyComponent, repConfig, repState: DatasetRepresentingState, data) => {
  const store = repConfig.store() as DatasetStoreConfig<any>;
  const allData = repState.lookup(data).fold(() => {
    return store.getFallbackEntry()(data);
  }, (d) => d);
  store.setValue()(component, allData);
  repConfig.onSetValue()(component, data);
};

const getValue = (component: AlloyComponent, repConfig, repState: DatasetRepresentingState) => {
  const store = repConfig.store() as DatasetStoreConfig<any>;
  const key = store.getDataKey()(component);
  return repState.lookup(key).fold(() => {
    return store.getFallbackEntry()(key);
  }, (data) => {
    return data;
  });
};

const onLoad = (component: AlloyComponent, repConfig, repState: DatasetRepresentingState) => {
  const store = repConfig.store() as DatasetStoreConfig<any>;
  repState.update(store.initialDataset());
  store.initialValue().each((data) => {
    setValue(component, repConfig, repState, data);
  });
};

const onUnload = (component: AlloyComponent, repConfig, repState: DatasetRepresentingState) => {
  repState.clear();
};

export default [
  FieldSchema.option('initialValue'),
  FieldSchema.strict('getFallbackEntry'),
  FieldSchema.strict('getDataKey'),
  FieldSchema.strict('setValue'),
  FieldSchema.defaulted('initialDataset', [ ]),
  Fields.output('manager', {
    setValue,
    getValue,
    onLoad,
    onUnload,
    state: datasetState
  })
];