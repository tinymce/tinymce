define(
  'ephox.alloy.api.component.SketchBehaviours',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Arr, Fun) {
    var field = function (name, forbidden) {
      return FieldSchema.defaultedObjOf(name, { }, Arr.map(forbidden, function (f) {
        return FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name);
      }).concat([
        FieldSchema.state('dump', Fun.identity)
      ]));
    };

    var get = function (data) {
      return data.dump();
    };

    return {
      field: field,
      get: get
    };
  }
);
