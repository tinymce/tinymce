define(
  'ephox.alloy.api.ui.DropdownApis',

  [

  ],

  function () {
    var showValue = function (dropdown, value) {
      dropdown.apis().showValue(value);
    };

    return {
      showValue: showValue
    };
  }
);