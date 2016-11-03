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

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.strict('query'),
        FieldSchema.strict('set')
      ])
    );

    var doGetValue = function (component, repInfo) {
      return repInfo.query()(component);
    };

    var doSetValue = function (component, repInfo, value) {
      repInfo.set()(component, value);
    };

    var doSetValueFrom = function (component, repInfo, source) {
      var v = doGetValue(source);
      doSetValue(component, repInfo, v);
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        getValue: Behaviour.tryActionOpt(behaviourName, info, 'getValue', doGetValue),
        setValue: Behaviour.tryActionOpt(behaviourName, info, 'setValue', doSetValue),
        setValueFrom: Behaviour.tryActionOpt(behaviourName, info, 'setValueFrom', doSetValueFrom)
      };
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