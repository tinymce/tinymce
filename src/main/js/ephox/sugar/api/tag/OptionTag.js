define(
  'ephox.sugar.api.tag.OptionTagTag',

  [

  ],

  function () {
    var setValue = function (option, value, text) {
      var optionDom = option.dom();
      optionDom.value = value;
      optionDom.text = text;
    };

    return {
      setValue: setValue
    };
  }
);