define(
  'ephox.alloy.data.Fields',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (FieldSchema, Arr, Fun) {

    var initSize = FieldSchema.strictObjOf('initSize', [
      FieldSchema.strict('numColumns'),
      FieldSchema.strict('numRows')
    ]);

    var members = function (required) {
      return FieldSchema.strictObjOf('members', Arr.map(required, FieldSchema.strict));
    };

    return {
      initSize: Fun.constant(initSize),
      members: members
    };
  }
);