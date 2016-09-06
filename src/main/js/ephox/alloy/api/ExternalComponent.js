define(
  'ephox.alloy.api.ExternalComponent',

  [
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],

  function (NoContextApi, Tagger, FieldSchema, ValueSchema, Fun, Cell) {
    var externalSpec = ValueSchema.objOf([
      FieldSchema.defaulted('label', 'unlabelled'),
      FieldSchema.strict('element'),
      FieldSchema.option('uid')
    ]);
    var build = function (spec) {
      var extSpec = ValueSchema.asStructOrDie('external.component', externalSpec, spec);
      var systemApi = Cell(NoContextApi());
      
      var connect = function (newApi) {
        systemApi.set(newApi);
      };

      var disconnect = function () {
        systemApi.set(NoContextApi());
      };

      var debugSystem = function () {
        return systemApi.get().debugLabel();
      };

      extSpec.uid().each(function (uid) {
        console.log('here', uid);
        Tagger.writeOnly(extSpec.element(), uid);
      });

      return {
        getSystem: systemApi.get,
        debugSystem: debugSystem,
        connect: connect,
        disconnect: disconnect,
        label: Fun.constant(extSpec.label()),
        element: Fun.constant(extSpec.element()),
        // Note: this is only the original components.
        components: Fun.constant([ ]),
        events: Fun.constant({ }),
        apis: Fun.constant({ })
      };
    };

    return {
      build: build
    };
  }
);