import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingState, CouplingConfig } from './CouplingTypes';

const getCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent =>
  // console.log('state', coupleState.readState());
  coupleState.getOrCreate(component, coupleConfig, name);

export {
  getCoupled
};
