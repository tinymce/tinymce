define(
  'ephox.alloy.api.component.CompBehaviours',

  [
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Coupling',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Docking',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Invalidating',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Pinching',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Replacing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.behaviour.Streaming',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.behaviour.Unselecting',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Result',
    'global!Error'
  ],

  function (
    Composing, Coupling, Disabling, Docking, Dragging, Focusing, Highlighting, Invalidating, Keying, Pinching, Positioning, Receiving, Replacing, Representing,
    Sandboxing, Sliding, Streaming, Tabstopping, Toggling, Unselecting, NoState, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Fun, Obj, Result, Error
  ) {
    var alloyBehaviours = [
      Toggling,
      Composing,
      Coupling,
      Disabling,
      Docking,
      Dragging,
      Focusing,
      Highlighting,
      Invalidating,
      Keying,
      Pinching,
      Positioning,
      Receiving,
      Replacing,
      Representing,
      Sandboxing,
      Sliding,
      Streaming,
      Tabstopping,
      Unselecting
    ];

    var getDefaultBehaviours = function (spec) {
      return Arr.filter(alloyBehaviours, function (b) {
        return Objects.hasKey(spec, 'behaviours') && Objects.hasKey(spec.behaviours, b.name());
      });
    };

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
    }

    var generate = function (spec) {
      var custom = Objects.readOptFrom(spec, 'customBehaviours').getOr([ ]);
      var alloy = getDefaultBehaviours(spec);

      var all = custom.concat(alloy);
      return generateFrom(spec, all);
    };

    return {
      generate: generate,
      generateFrom: generateFrom
    };
  }
);
