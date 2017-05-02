define(
  'ephox.alloy.api.behaviour.Behaviour',

  [
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, NoState, FieldSchema, Objects, ValueSchema, Fun) {
    var derive = function (capabilities) {
      return Objects.wrapAll(capabilities);
    };

    var simpleSchema = ValueSchema.objOfOnly([
      FieldSchema.strict('fields'),
      FieldSchema.strict('name'),
      FieldSchema.defaulted('active', { }),
      FieldSchema.defaulted('apis', { }),
      FieldSchema.defaulted('extra', { }),
      FieldSchema.defaulted('state', NoState)
    ]);

    var create = function (data) {
      var value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, simpleSchema, data);
      return Behaviour.create(value.fields, value.name, value.active, value.apis, value.extra, value.state);
    };

    var modeSchema = ValueSchema.objOfOnly([
      FieldSchema.strict('branchKey'),
      FieldSchema.strict('branches'),
      FieldSchema.strict('name'),
      FieldSchema.defaulted('active', { }),
      FieldSchema.defaulted('apis', { }),
      FieldSchema.defaulted('extra', { }),
      FieldSchema.defaulted('state', NoState)
    ]);

    var createModes = function (data) {
      var value = ValueSchema.asRawOrDie('Creating behaviour: ' + data.name, modeSchema, data);
      return Behaviour.createModes(
        ValueSchema.choose(value.branchKey, value.branches),
        value.name, value.active, value.apis, value.extra, value.state
      );
    };

    return {
      derive: derive,
      revoke: Fun.constant(undefined),
      noActive: Fun.constant({ }),
      noApis: Fun.constant({ }),
      noExtra: Fun.constant({ }),
      noState: Fun.constant(NoState),
      create: create,
      createModes: createModes
    };
  }
);