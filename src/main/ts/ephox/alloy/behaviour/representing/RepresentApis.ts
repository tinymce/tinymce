var onLoad = function (component, repConfig, repState) {
  repConfig.store().manager().onLoad(component, repConfig, repState);
};

var onUnload = function (component, repConfig, repState) {
  repConfig.store().manager().onUnload(component, repConfig, repState);
};

var setValue = function (component, repConfig, repState, data) {
  repConfig.store().manager().setValue(component, repConfig, repState, data);
};

var getValue = function (component, repConfig, repState) {
  return repConfig.store().manager().getValue(component, repConfig, repState);
};

export default <any> {
  onLoad: onLoad,
  onUnload: onUnload,
  setValue: setValue,
  getValue: getValue
};