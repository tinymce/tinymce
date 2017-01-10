define(
  'ephox.alloy.api.ui.GuiTypes',

  [
    'ephox.boulder.api.Objects',
    'ephox.epithet.Id'
  ],

  function (Objects, Id) {
    var premadeTag = Id.generate('alloy-premade');


    var premade = function (comp) {
      return Objects.wrap(premadeTag, comp);
    };

    var getPremade = function (spec) {
      return Objects.readOptFrom(spec, premadeTag);
    };

    return {
      premade: premade,
      getPremade: getPremade
    };
  }
);