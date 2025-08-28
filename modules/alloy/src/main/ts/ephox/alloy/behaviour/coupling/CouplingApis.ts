import type { Optional } from '@ephox/katamari';

import type { AlloyComponent } from '../../api/component/ComponentApi';

import type { CouplingState, CouplingConfig } from './CouplingTypes';

const getCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent =>
  coupleState.getOrCreate(component, coupleConfig, name);

const getExistingCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): Optional<AlloyComponent> =>
  coupleState.getExisting(component, coupleConfig, name);

export {
  getCoupled,
  getExistingCoupled
};
