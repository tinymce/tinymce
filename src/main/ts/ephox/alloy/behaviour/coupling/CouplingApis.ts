import { AlloyComponent } from '../../api/component/ComponentApi';
import { CouplingState, CouplingConfig } from 'ephox/alloy/behaviour/coupling/CouplingTypes';

const getCoupled = function (component: AlloyComponent, coupleConfig: CouplingConfig, coupleState: CouplingState, name: string): AlloyComponent {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};