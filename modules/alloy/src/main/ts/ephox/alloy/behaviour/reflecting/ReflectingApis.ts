import { AlloyComponent } from '../../api/component/ComponentApi';
import { ReflectingConfig, ReflectingState } from './ReflectingTypes';

const getState = <I, S>(component: AlloyComponent, replaceConfig: ReflectingConfig<I, S>, reflectState: ReflectingState<S>) => reflectState;

export {
  getState
};
