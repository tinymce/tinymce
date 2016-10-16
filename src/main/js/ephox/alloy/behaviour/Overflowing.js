define(
  'ephox.alloy.behaviour.Overflowing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var behaviourName = 'overfowing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        /* */
      ])
    );



    var doRefresh = function (component, bInfo) {
      /* */
    };

    var exhibit = function (info, base) {
      return info[behaviourName]().fold(function () {
        return DomModification.nu({ });
      }, function (/* */) {
        return DomModification.nu({ });
      });
    };

    var apis = function (info) {
      return {
        refresh: Behaviour.tryActionOpt(behaviourName, info, 'refresh', doRefresh)
      };
    };

    var handlers = function (info) {
      var bInfo = info[behaviourName]();
      return bInfo.fold(function () {
        return { };
      }, function (/* */) {
        return { };
      });
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: handlers,
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);
