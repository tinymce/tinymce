define(
  'ephox.alloy.construct.Components',

  [
    'ephox.alloy.api.NoContextApi',
    'ephox.alloy.registry.Tagger',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Element'
  ],

  function (NoContextApi, Tagger, FieldSchema, ValueSchema, Fun, Result, Cell, Element) {
    var externalSpec = ValueSchema.objOf([
      FieldSchema.defaulted('label', 'unlabelled'),
      FieldSchema.strict('element'),
      FieldSchema.option('uid')
    ]);

    var text = function (textContent) {
      var element = Element.fromText(textContent);

      return {
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
    };

    var premade = function (spec) {
      return spec;
    };

    var external = function (spec) {

      var extSpec = ValueSchema.asStructOrDie('external.component', externalSpec, spec);
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

      return self;
    };

    return {
      external: external,
      premade: premade,
      text: text
    };
  }
);