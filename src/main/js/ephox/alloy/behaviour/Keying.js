define(
  'ephox.alloy.behaviour.Keying',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.keying.CyclicType',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, CyclicType, FieldPresence, FieldSchema, ValueSchema, Fun) {
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
          cyclic: CyclicType.schema()
        }
      )
    );

    return Behaviour.contract({
      name: Fun.constant('keying'),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
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