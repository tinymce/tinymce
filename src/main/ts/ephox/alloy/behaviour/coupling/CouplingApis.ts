import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const getCoupled = function (component, coupleConfig, coupleState, name): AlloyComponent {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};