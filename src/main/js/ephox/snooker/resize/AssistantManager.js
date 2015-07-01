define(
  'ephox.snooker.resize.AssistantManager',

  [
    'ephox.snooker.resize.Bars',
    'ephox.sugar.api.Css'
  ],

  function (Bars, Css) {
    var getInt = function (element, property) {
      return parseInt(Css.get(element, property), 10);
    };

    var hideBars = function (wire) {
      Bars.hide(wire);
    };

    var showBars = function (wire) {
      Bars.show(wire);
    };

    return {
      hideBars: hideBars,
      showBars: showBars,
      getInt: getInt
    };
  }
);