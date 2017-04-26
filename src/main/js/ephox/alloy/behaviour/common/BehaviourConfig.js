define(
  'ephox.alloy.behaviour.common.BehaviourConfig',

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
      
      var info = ValueSchema.asStruct('component.behaviours', ValueSchema.objOf(schema), spec.behaviours).fold(function (errInfo) {
        throw new Error(
          ValueSchema.formatError(errInfo) + '\nComplete spec:\n' +
            JSON.stringify(spec, null, 2)
        );
      }, Fun.identity);
      // var behaviours = Objects.readOr('customBehaviours', [])(spec);
      // var bs = getDefaultBehaviours(spec);
      // var behaviourSchema = Arr.map(bs.concat(behaviours), function (b) {
      //   return FieldSchema.option(b.name());
      // });
      // console.log('behaviourSchema', ValueSchema.objOf(behaviourSchema).toString());
      return {
        list: all,
        info: Obj.map(info, function (v, k) {
          return Fun.constant(v().map(function (vv) {
            return {
              config: vv.config(),
              state: vv.state().init(vv.config())
            };
          }));
        })
      };
    };

    return {
      generateFrom: generateFrom
    };
  }
);
