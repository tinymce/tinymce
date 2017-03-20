define(
  'ephox.alloy.api.component.GuiFactory',

  [
    'ephox.alloy.api.component.Component',
    'ephox.alloy.api.system.NoContextApi',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.CustomSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.katamari.api.Cell',
    'ephox.sugar.api.node.Element',
    'global!Error'
  ],

  function (Component, NoContextApi, GuiTypes, DefaultEvents, Tagger, CustomSpec, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Option, Result, Cell, Element, Error) {
    var buildSubcomponents = function (spec) {
      var components = Objects.readOr('components', [ ])(spec);
      return Arr.map(components, build);
    };

    var buildFromSpec = function (userSpec) {
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

      return external({
        element: element
      });
    };

    var external = function (spec) {
      var extSpec = ValueSchema.asStructOrDie('external.component', ValueSchema.objOf([
        FieldSchema.strict('element'),
        FieldSchema.option('uid')
      ]), spec);

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
        config: Option.none,
        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(extSpec.element()),
        syncComponents: Fun.noop,
        components: Fun.constant([ ]),
        events: Fun.constant({ }),

        logSpec: function () {
          console.log('debugging :: external spec', spec);
        },
        logInfo: function () {
          console.log('debugging :: external spec has no info');
        }
      };

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