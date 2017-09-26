define(
  'ephox.alloy.keying.AcyclicType',

  [
    'ephox.alloy.keying.TabbingTypes',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (TabbingTypes, FieldSchema, Fun) {
    return TabbingTypes.create(
      FieldSchema.state('cyclic', Fun.constant(false))
    );
  }
);