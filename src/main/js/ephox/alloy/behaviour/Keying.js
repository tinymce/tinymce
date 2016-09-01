define(
  'ephox.alloy.behaviour.Keying',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.keying.CyclicType',
    'ephox.alloy.keying.ExecutionType',
    'ephox.alloy.keying.FlatgridType',
    'ephox.alloy.keying.FlowType',
    'ephox.alloy.keying.MatrixType',
    'ephox.alloy.keying.MenuType',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Behaviour, DomModification, CyclicType, ExecutionType, FlatgridType, FlowType, MatrixType, MenuType, FieldPresence, FieldSchema, ValueSchema, Merger, Fun, Error) {
    var doFocusIn = function (component) {
      var system = component.getSystem();
      system.triggerFocus(component.element(), component.element());
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      var handlerApis = info.keying().fold(function () {
        return { };
      }, function (keyInfo) {
        // Get a better error.
        if (keyInfo.handler === undefined) throw new Error('Keymode missing handler output');
        // Note, each type needs to output this.
        var handler = keyInfo.handler();
        return handler.toApis(keyInfo);
      });

      return Merger.deepMerge(handlerApis, {
        focusIn: Behaviour.tryActionOpt('keying', info, 'focusIn', doFocusIn)
      });
    };

    var schema = FieldSchema.field(
      'keying',
      'keying',
      FieldPresence.asOption(),
      ValueSchema.choose(
        'mode',
        {
          // Note, these are only fields.
          cyclic: CyclicType.schema(),
          flow: FlowType.schema(),
          flatgrid: FlatgridType.schema(),
          matrix: MatrixType.schema(),
          execution: ExecutionType.schema(),
          menu: MenuType.schema()
        }
      )
    );

    var handlers = function (info) {
      return info.keying().fold(function () {
        return { };
      }, function (keyInfo) {
        // Get a better error.
        if (keyInfo.handler === undefined) throw new Error('Keymode missing handler output');
        // Note, each type needs to output this.
        var handler = keyInfo.handler();
        return handler.toEvents(keyInfo);
      });
    };

    return Behaviour.contract({
      name: Fun.constant('keying'),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);