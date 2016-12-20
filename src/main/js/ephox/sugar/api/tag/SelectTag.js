define(
  'ephox.sugar.api.tag.SelectTag',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option'
  ],

  function (Arr, Option) {
    var getValueFromIndex = function (options, index) {
      var optionVal = options[index];
      return optionVal === undefined || index === -1 ? Option.none() : Option.from(optionVal.value);
    };

    var getValue = function (select) {
      var selectDom = select.dom();
      return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
    };

    var add = function (select, option) {
      select.dom().add(option.dom());
    };

    var addAll = function (select, options) {
      Arr.each(options, function (option) {
        add(select, option);
      });
    };

    var setSelected = function (select, index) {
      select.dom().selectedIndex = index;
    };

    return {
      getValue: getValue,
      add: add,
      addAll: addAll,
      setSelected: setSelected
    };
  }
);