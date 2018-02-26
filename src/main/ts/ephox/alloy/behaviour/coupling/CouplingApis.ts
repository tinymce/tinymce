const getCoupled = function (component, coupleConfig, coupleState, name) {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export {
  getCoupled
};