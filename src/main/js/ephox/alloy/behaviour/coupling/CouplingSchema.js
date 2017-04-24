define(
  'ephox.alloy.behaviour.coupling.CouplingSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Result',
    'global!Error'
  ],

  function (FieldSchema, Objects, ValueSchema, Obj, Json, Result, Error) {
    return [
      FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue()))
    ];
  }
);