import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingState, CouplingConfig } from '../../behaviour/coupling/CouplingTypes';

const getCoupled = (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent => {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};