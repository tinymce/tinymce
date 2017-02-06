define(
  'ephox.alloy.api.ui.UiBuilder',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.classify.Type',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, FieldSchema, Type, Merger, Fun) {
    var single = function (owner, schema, factory, spec) {
      return {
        name: Fun.constant(owner),
        schema: Fun.constant(
          FieldSchema.strictObjOf(owner, schema)
        )
      };
    };

    var composite = function (owner, schema,  partTypes, factory, spec) {
      return schema;
    };

    var supplyUid = function (spec) {
      return Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);
    };

    return {
      supplyUid: supplyUid,
      single: single,
      composite: composite
    };
  }
);