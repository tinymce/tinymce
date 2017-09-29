define(
  'ephox.alloy.api.ui.GuiTypes',

  [
    'ephox.alloy.debugging.FunctionAnnotator',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Id',
    'global!Array'
  ],

  function (FunctionAnnotator, Objects, Fun, Id, Array) {
    var premadeTag = Id.generate('alloy-premade');
    var apiConfig = Id.generate('api');


    var premade = function (comp) {
      return Objects.wrap(premadeTag, comp);
    };

    var getPremade = function (spec) {
      return Objects.readOptFrom(spec, premadeTag);
    };

    var makeApi = function (f) {
      return FunctionAnnotator.markAsSketchApi(function (component/*, ... */) {
        var args = Array.prototype.slice.call(arguments, 0);
        var spi = component.config(apiConfig);
        return f.apply(undefined, [ spi ].concat(args));
      }, f);
    };

    return {
      apiConfig: Fun.constant(apiConfig),
      makeApi: makeApi,
      premade: premade,
      getPremade: getPremade
    };
  }
);