define(
  'ephox.alloy.behaviour.Keying',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.keying.CyclicType',
    'ephox.alloy.keying.FlowType',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Behaviour, DomModification, CyclicType, FlowType, FieldPresence, FieldSchema, ValueSchema, Fun, Error) {
    var doFocusIn = function (component) {
      var system = component.getSystem();
      system.triggerFocus(component.element(), component.element());
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        focusIn: Behaviour.tryActionOpt('keying', info, 'toggle', doFocusIn)
      };
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
          flow: FlowType.schema()
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


/*

FieldSchema.field('keying', 'keying', FieldPresence.asOption(), ValueSchema.oneOf('mode', [
  FieldSchema.candidate('cyclic', schema1),
  FieldSchema.candidate('flow', schema2)
  schema2,
  schema3,
  schema4
]))


{
  keying: {
    mode: 'cyclic',
    blah: 'dog',
    output: handler.
  }
}

*/