import { AlloyComponent } from '../../api/component/ComponentApi';
import { RepresentingConfig, RepresentingState } from './RepresentingTypes';

const onLoad = (component: AlloyComponent, repConfig: RepresentingConfig, repState: RepresentingState) => {
  repConfig.store.manager.onLoad(component, repConfig, repState);
};

const onUnload = (component: AlloyComponent, repConfig: RepresentingConfig, repState: RepresentingState) => {
  repConfig.store.manager.onUnload(component, repConfig, repState);
};

const setValue = (component: AlloyComponent, repConfig: RepresentingConfig, repState: RepresentingState, data: any) => {
  repConfig.store.manager.setValue(component, repConfig, repState, data);
};

const getValue = (component: AlloyComponent, repConfig: RepresentingConfig, repState: RepresentingState) => repConfig.store.manager.getValue(component, repConfig, repState);

const getState = (component: AlloyComponent, repConfig: RepresentingConfig, repState: RepresentingState): RepresentingState => repState;

export {
  onLoad,
  onUnload,
  setValue,
  getValue,
  getState
};
