define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.construct.Components',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.ContainerSpec',
    'ephox.alloy.spec.CustomSpec',
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

  function (Component, Components, DefaultEvents, Tagger, ContainerSpec, CustomSpec, Objects, Arr, Obj, Merger, Json, Fun, Option, Options, Result, Error) {
    // var knownSpecs = {
    //   container: ContainerSpec.make,
    //   custom: CustomSpec.make,
      
     

    
    //   // 'slide-form': SlideFormSpec.make,
    //   // Add other specs here.
    // };

    // var unknownSpec = function (uiType, userSpec) {
    //   var known = Obj.keys(knownSpecs);
    //   return new Result.error(new Error('Unknown component type: ' + uiType + '.\nKnown types: ' + 
    //     Json.stringify(known, null, 2) + '\nEntire spec: ' + Json.stringify(userSpec, null, 2)
    //   ));
    // };

    var buildSubcomponents = function (spec) {
      var components = Objects.readOr('components', [ ])(spec);
      return Arr.map(components, build);
    };

    var buildFromSpec = function (userSpec) {
      console.log('userSpec', userSpec);
      var spec = CustomSpec.make(userSpec);

      // Build the subcomponents
      var components = buildSubcomponents(spec);
    
      var completeSpec = Merger.deepMerge(
        DefaultEvents,
        spec,
        Objects.wrap('components', components)
      );

      return Result.value(
        Component.build(completeSpec)
      );
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
    var build = function (rawUserSpec) {
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, rawUserSpec);

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