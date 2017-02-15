define(
  'ephox.alloy.api.behaviour.Behaviour',

  [
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (Behaviour, FieldSchema, Objects, ValueSchema, Fun) {
    var derive = function (capabilities) {
      return Objects.wrapAll(capabilities);
    };
  
    var create = function (fields, name, active, apis, extra) {
      return Behaviour.create(
        FieldSchema.optionObjOfOnly(name, fields),
        name,
        active,
        apis,
        extra
      );
    };

    var createModes = function (branchKey, branches, name, active, apis, extra) {
      return Behaviour.create(
        FieldSchema.optionOf(name, ValueSchema.choose(branchKey, branches)),
        name,
        active,
        apis,
        extra
      );
    };

    return {
      derive: derive,
      revoke: Fun.constant(undefined),
      create: create,
      createModes: createModes
    };
  }
);