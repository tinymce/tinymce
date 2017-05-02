define(
  'ephox.alloy.behaviour.common.BehaviourBlob',

  [
    'ephox.alloy.behaviour.common.NoState',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.JSON',
    'global!Error'
  ],

  function (NoState, FieldPresence, FieldSchema, ValueSchema, Arr, Fun, Obj, JSON, Error) {
    var generateFrom = function (spec, all) {
      var schema = Arr.map(all, function (a) {
        return FieldSchema.field(a.name(), a.name(), FieldPresence.asOption(), ValueSchema.objOf([
          FieldSchema.strict('config'),
          FieldSchema.defaulted('state', NoState)
        ]));
      });
      
      var validated = ValueSchema.asStruct('component.behaviours', ValueSchema.objOf(schema), spec.behaviours).fold(function (errInfo) {
        throw new Error(
          ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
            JSON.stringify(spec, null, 2)
        );
      }, Fun.identity);
      
      return {
        list: all,
        data: Obj.map(validated, function (blobOptionThunk/*, rawK */) {
          var blobOption = blobOptionThunk();
          return Fun.constant(blobOption.map(function (blob) {
            return {
              config: blob.config(),
              state: blob.state().init(blob.config())
            };
          }));
        })
      };
    };

    var getBehaviours = function (bData) {
      return bData.list;
    };

    var getData = function (bData) {
      return bData.data;
    };

    return {
      generateFrom: generateFrom,
      getBehaviours: getBehaviours,
      getData: getData
    };
  }
);
