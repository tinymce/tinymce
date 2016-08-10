define(
  'ephox.alloy.behaviour.CustomBehaviour',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, DomDefinition, DomModification, FieldPresence, FieldSchema, ValueSchema, Obj, Fun) {
    var activeApiSchema = ValueSchema.objOf([
      FieldSchema.defaulted('exhibit', function () {
        return DomDefinition.modification({ });
      }),
      FieldSchema.defaulted('handlers', Fun.constant({ })),
      FieldSchema.defaulted('apis', Fun.constant({ })),
      FieldSchema.strict('schema')
    ]);

    return function (name, activeApi) {
      var customApi = ValueSchema.asRaw('custom.behaviour', activeApiSchema, activeApi).getOrDie();
      console.log('customApi', customApi);
      
      var exhibit = function (info, base) {
        return info[name]().fold(function () {
          console.log('nothing here');
          return DomModification.nu({ });
        }, function (bInfo) {
          return customApi.exhibit(bInfo, base);
        });
      };

      var handlers = function (info) {
        return info[name]().fold(function () {
          return { };
        }, function (bInfo) {
          return customApi.handlers(bInfo);
        });
      };

      var apis = function (info) {
        return Obj.map(customApi.apis(), function (doApi, apiName) {
          return Behaviour.tryActionOpt(name, info, apiName, doApi);
        });
      };

      var schema = FieldSchema.field(name, name, FieldPresence.asOption(), customApi.schema());

      return Behaviour.contract({
        exhibit: exhibit,
        handlers: handlers,
        apis: apis,
        schema: Fun.constant(schema),
        name: Fun.constant(name)
      });
    };
  }
);