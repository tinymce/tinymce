var getCoupled = function (component, coupleConfig, coupleState, name) {
  return coupleState.getOrCreate(component, coupleConfig, name);
};

export default <any> {
  getCoupled: getCoupled
};