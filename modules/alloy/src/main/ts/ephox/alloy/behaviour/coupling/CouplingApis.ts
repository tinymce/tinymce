import { Optional } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingState, CouplingConfig } from './CouplingTypes';

const getCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent =>
  coupleState.getOrCreate(component, coupleConfig, name);

const getExistingCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): Optional<AlloyComponent> =>
  coupleState.getExisting(component, coupleConfig, name);

export {
  getCoupled,
  getExistingCoupled
};
