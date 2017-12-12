var getCurrent = function (component, composeConfig, composeState) {
  return composeConfig.find()(component);
};

export default <any> {
  getCurrent: getCurrent
};