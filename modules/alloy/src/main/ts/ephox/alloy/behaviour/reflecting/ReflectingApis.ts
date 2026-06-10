import type { AlloyComponent } from '../../api/component/ComponentApi';

import type { ReflectingConfig, ReflectingState } from './ReflectingTypes';

const getState = <I, S>(component: AlloyComponent, replaceConfig: ReflectingConfig<I, S>, reflectState: ReflectingState<S>): ReflectingState<S> =>
  reflectState;

export {
  getState
};
