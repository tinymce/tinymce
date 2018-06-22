import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingState, CouplingConfig } from '../../behaviour/coupling/CouplingTypes';

const getCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent => {
  // console.log('state', coupleState.readState());
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};