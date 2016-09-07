define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.api.ExternalComponent',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.CustomSpec',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.InputSpec',
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

  function (Component, ExternalComponent, DefaultEvents, ButtonSpec, CustomSpec, FormLabelSpec, InputSpec, Objects, Arr, Obj, Merger, Json, Fun, Option, Result, Error) {
    var knownSpecs = {
      custom: CustomSpec.make,
      button: ButtonSpec.make,
      input: InputSpec.make,
      formlabel: FormLabelSpec.make

      // Add other specs here.
    };

    var getPrebuilt = function (userSpec) {
      return userSpec.built !== undefined ? Option.some(userSpec.built) : Option.none();
    };

    var getExternal = function (userSpec) {
      return userSpec.external !== undefined ? Option.some(userSpec.external) : Option.none();
    };

    var unknownSpec = function (uiType) {
      var known = Obj.keys(knownSpecs);
      return new Result.error(new Error('Unknown component type: ' + uiType + '.\nKnown types: ' + 
        Json.stringify(known, null, 2)
      ));
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

        // Build the subcomponents
        var components = buildSubcomponents(spec);
        postprocess(spec, components);

        var completeSpec = Merger.deepMerge(
          DefaultEvents,
          spec,
          Objects.wrap('components', components)
        );
        return Result.value(
          Component.build(completeSpec)
        );
      });
    };

    // INVESTIGATE: A better way to provide 'meta-specs'
    var build = function (userSpec) {
      var component = getPrebuilt(userSpec).fold(function () {
        return getExternal(userSpec).fold(function () {
          return buildFromSpec(userSpec);
        }, function (elem) {
          return Result.value(
            ExternalComponent.build(elem)
          );
        });
      }, Result.value);

      return component.getOrDie();
    };

    return {
      build: build
    };
  }
);  