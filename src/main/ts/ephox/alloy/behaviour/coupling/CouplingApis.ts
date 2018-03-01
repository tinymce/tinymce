import { ComponentApiType } from 'ephox/alloy/api/component/Component';

const getCoupled = function (component, coupleConfig, coupleState, name): ComponentApiType {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};