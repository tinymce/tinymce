const getCurrent = function (component, composeConfig, composeState) {
  return composeConfig.find()(component);
};

export {
  getCurrent
};