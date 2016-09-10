define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.construct.Components',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.spec.ButtonSpec',
    'ephox.alloy.spec.CustomSpec',
    'ephox.alloy.spec.DropdownButtonSpec',
    'ephox.alloy.spec.DropdownMenuSpec',
    'ephox.alloy.spec.FormLabelSpec',
    'ephox.alloy.spec.InlineSpec',
    'ephox.alloy.spec.InputSpec',
    'ephox.alloy.spec.MenuSpec',
    'ephox.alloy.spec.TypeaheadSpec',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.perhaps.Options',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Component, Components, DefaultEvents, ButtonSpec, CustomSpec, DropdownButtonSpec, DropdownMenuSpec, FormLabelSpec, InlineSpec, InputSpec, MenuSpec, TypeaheadSpec, Objects, Arr, Obj, Merger, Json, Fun, Option, Options, Result, Error) {
    var knownSpecs = {
      custom: CustomSpec.make,
      button: ButtonSpec.make,
      input: InputSpec.make,
      formlabel: FormLabelSpec.make,
      dropdownmenu: DropdownMenuSpec.make,
      dropdown: DropdownButtonSpec.make,
      menu: MenuSpec.make,
      inline: InlineSpec.make,
      typeahead: TypeaheadSpec.make

      // Add other specs here.
    };

    var unknownSpec = function (uiType, userSpec) {
      var known = Obj.keys(knownSpecs);
      return new Result.error(new Error('Unknown component type: ' + uiType + '.\nKnown types: ' + 
        Json.stringify(known, null, 2) + '\nEntire spec: ' + Json.stringify(userSpec, null, 2)
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
        return unknownSpec(uiType, userSpec);
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

    var buildFromSpecOrDie = function (userSpec) {
      return buildFromSpec(userSpec).getOrDie();
    };

    var types = [
      { type: 'uiType', build: buildFromSpecOrDie, only: false },
      { type: 'external', build: Components.external, only: true },
      { type: 'built', build: Components.premade, only: true },
      { type: 'text', build: Components.text, only: true }
    ];

    // INVESTIGATE: A better way to provide 'meta-specs'
    var build = function (userSpec) {
      var builder = Options.findMap(types, function (t) {
        return userSpec[t.type] !== undefined ? Option.some(function () {
          var param = t.only === true ? userSpec[t.type] : userSpec;
          return t.build(param);
        }) : Option.none();
      }).getOrThunk(function () {
        throw new Error('Did not recognise any component type in ' + Json.stringify(userSpec, null, 2))
      });

      return builder();
    };

    return {
      build: build
    };
  }
);  