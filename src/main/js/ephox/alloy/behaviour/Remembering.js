define(
  'ephox.alloy.behaviour.Remembering',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'remembering';

    var schema = Behaviour.schema(behaviourName, [
      FieldSchema.strict('data')
    ]);

    var doGetData = function (component, rememberInfo) {
      return rememberInfo.data();
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return Behaviour.activeApis(
        behaviourName,
        info,
        {
          getData: doGetData
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