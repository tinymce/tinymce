var setValue = function (option, value, text) {
  var optionDom = option.dom();
  optionDom.value = value;
  optionDom.text = text;
};

export default <any> {
  setValue: setValue
};