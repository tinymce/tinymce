const onLoad = function (component, repConfig, repState) {
  repConfig.store().manager().onLoad(component, repConfig, repState);
};

const onUnload = function (component, repConfig, repState) {
  repConfig.store().manager().onUnload(component, repConfig, repState);
};

const setValue = function (component, repConfig, repState, data) {
  repConfig.store().manager().setValue(component, repConfig, repState, data);
};

const getValue = function (component, repConfig, repState) {
  return repConfig.store().manager().getValue(component, repConfig, repState);
};

export {
  onLoad,
  onUnload,
  setValue,
  getValue
};