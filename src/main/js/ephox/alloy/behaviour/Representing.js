define(
  'ephox.alloy.behaviour.Representing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'representing';

    var schema = Behaviour.schema(behaviourName, [
      FieldSchema.strict('query'),
      FieldSchema.strict('set')
    ]);

    var doGetValue = function (component, repInfo) {
      return repInfo.query()(component);
    };

    var doSetValue = function (component, repInfo, value) {
      repInfo.set()(component, value);
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return Behaviour.activeApis(
        behaviourName,
        info,
        {
          getValue: doGetValue,
          setValue: doSetValue
        }
      );
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);