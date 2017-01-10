define(
  'ephox.alloy.api.GuiFactory',

  [
    'ephox.alloy.api.Component',
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.CustomSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.epithet.Id',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Element',
    'global!Error'
  ],

  function (Component, NoContextApi, GuiTypes, DefaultEvents, Tagger, CustomSpec, FieldSchema, Objects, ValueSchema, Arr, Id, Merger, Fun, Result, Cell, Element, Error) {
    var buildSubcomponents = function (spec) {
      var components = Objects.readOr('components', [ ])(spec);
      return Arr.map(components, build);
    };

    var premadeTag = Id.generate('alloy-premade');

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

    var text = function (textContent) {
      var element = Element.fromText(textContent);

      var made = {
        getSystem: Fun.die('Cannot call getSystem on text node'),
        debugSystem: Fun.noop,
        connect: Fun.noop,
        disconnect: Fun.noop,
        label: Fun.constant('text'),
        element: Fun.constant(element),
        components: Fun.constant([ ]),
        events: Fun.constant({ }),
        apis: Fun.constant({ })
      };

      return GuiTypes.premade(made);
    };

    var external = function (spec) {
      var extSpec = ValueSchema.asStructOrDie('external.component', [
        FieldSchema.strict('element'),
        FieldSchema.option('uid')
      ], spec);

      var systemApi = Cell(NoContextApi());
      
      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi(function () {
          return self; 
        }));
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      extSpec.uid().each(function (uid) {
        Tagger.writeOnly(extSpec.element(), uid);
      });

      var self = {
        getSystem: systemApi.get,
        debugSystem: debugSystem,
        connect: connect,
        disconnect: disconnect,
        label: Fun.constant(extSpec.label()),
        element: Fun.constant(extSpec.element()),
        components: Fun.constant([ ]),
        events: Fun.constant({ }),
        apis: Fun.constant({ })
      };

      // FIX: Invesitage whether I want to do it this way.
      return GuiTypes.premade(self);

    };

    // INVESTIGATE: A better way to provide 'meta-specs'
    var build = function (rawUserSpec) {

      return GuiTypes.getPremade(rawUserSpec).fold(function () {
        var userSpecWithUid = Merger.deepMerge({ uid: Tagger.generate('') }, rawUserSpec);
        return buildFromSpec(userSpecWithUid).getOrDie();
      }, function (prebuilt) {
        return prebuilt;
      });
    };

    return {
      build: build,
      premade: GuiTypes.premade,
      external: external,
      text: text
    };
  }
);  