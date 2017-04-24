define(
  'ephox.alloy.api.behaviour.Behaviour',

  [
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (Behaviour, FieldSchema, Objects, ValueSchema, Arr, Fun) {
    var derive = function (capabilities) {
      return Objects.wrapAll(capabilities);
    };

    var create = function (fields, name, active, apis, extra, _state) {
      return Behaviour.create(
        // This is the point where we need the schema to recognise
        // that perhaps this has already been validated. So the fields
        // here need to be wrapped in some way.
        // FieldSchema.optionObjOf(
        //   name,
          fields,
        // ),
        name,
        active,
        apis,
        extra,
        _state
      );
    };

    var createModes = function (branchKey, branches, name, active, apis, extra, _state) {
      return Behaviour.createModes(
        ValueSchema.choose(branchKey, branches),
        name,
        active,
        apis,
        extra,
        _state
      );
    };

    return {
      derive: derive,
      revoke: Fun.constant(undefined),
      noActive: Fun.constant({ }),
      noExtra: Fun.constant({ }),
      create: create,
      createModes: createModes
    };
  }
);