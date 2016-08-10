define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.events.DefaultEvents',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Component, DefaultEvents, Objects, Arr, Obj, Merger, Json, Fun, Option, Result, Error) {
    var knownSpecs = {
      custom: Fun.identity
      // Add other specs here.
    };

    var getPrebuilt = function (userSpec) {
      return userSpec.built !== undefined ? Option.some(userSpec.built) : Option.none();
    };

    var unknownSpec = function (uiType) {
      var known = Obj.keys(knownSpecs);
      return new Result.error('Unknown component type: ' + uiType + '.\nKnown types: ' + 
        Json.stringify(known, null, 2)
      );
    };

    var buildSubcomponents = function (spec) {
      var components = Objects.readOr('components', [ ])(spec);
      return Arr.map(components, build);
    };

    var postprocess = function (spec, components) {
      var f = Objects.readOr('postprocess', Fun.noop)(spec);
      f(components);
    };

    var buildFromSpec = function (userSpec) {
      var uiType = userSpec.uiType;
      return Objects.readOptFrom(knownSpecs, uiType).fold(function () {
        return unknownSpec(uiType);
      }, function (factory) {
        var spec = factory(userSpec);

        console.log('spec', spec);
        // Build the subcomponents
        var components = buildSubcomponents(spec);
        postprocess(spec, components);

        var completeSpec = Merger.deepMerge(
          DefaultEvents,
          spec,
          Objects.wrap('components', components)
        );
        return Component.build(completeSpec);
      });
    };

    var build = function (userSpec) {
      var component = getPrebuilt(userSpec).fold(function () {
        return buildFromSpec(userSpec);
      }, Result.value);

      return component.getOrDie();
    };

    return {
      build: build
    };
  }
);