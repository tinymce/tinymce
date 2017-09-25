define(
  'ephox.alloy.api.component.GuiFactory',

  [
    'ephox.alloy.api.component.Component',
    'ephox.alloy.api.component.ComponentApi',
    'ephox.alloy.api.system.NoContextApi',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.events.DefaultEvents',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.CustomSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.node.Element',
    'global!Error'
  ],

  function (
    Component, ComponentApi, NoContextApi, GuiTypes, DefaultEvents, Tagger, CustomSpec, FieldSchema, Objects, ValueSchema, Arr, Cell, Fun, Merger, Option, Result,
    Element, Error
  ) {
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
      var extSpec = ValueSchema.asStructOrDie('external.component', ValueSchema.objOfOnly([
        FieldSchema.strict('element'),
        FieldSchema.option('uid')
      ]), spec);

      var systemApi = Cell(NoContextApi());

      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi(function () {
          return me;
        }));
      };

      extSpec.uid().each(function (uid) {
        Tagger.writeOnly(extSpec.element(), uid);
      });

      var me = ComponentApi({
        getSystem: systemApi.get,
        config: Option.none,
        hasConfigured: Fun.constant(false),
        connect: connect,
        disconnect: disconnect,
        element: Fun.constant(extSpec.element()),
        spec: Fun.constant(spec),
        readState: Fun.constant('No state'),
        syncComponents: Fun.noop,
        components: Fun.constant([ ]),
        events: Fun.constant({ })
      });

      return GuiTypes.premade(me);
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