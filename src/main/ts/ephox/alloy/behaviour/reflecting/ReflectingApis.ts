import { AlloyComponent } from '../../api/component/ComponentApi';
import { ReflectingConfig, ReflectingState } from './ReflectingTypes';

const getState = <S>(component: AlloyComponent, replaceConfig: ReflectingConfig, reflectState: ReflectingState<S>) => {
  return reflectState;
};

export {
  getState
};