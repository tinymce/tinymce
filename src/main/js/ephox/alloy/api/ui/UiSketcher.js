define(
  'ephox.alloy.api.ui.UiSketcher',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.classify.Type',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, Type, Merger, Fun) {
    var single = function (owner, schema, factory, spec) {
      var specWithUid = supplyUid(spec);
      var detail = SpecSchema.asStructOrDie(owner, schema, specWithUid, [ ]);
      return factory(detail, specWithUid);
    };

    var composite = function (owner, schema,  partTypes, factory, spec) {      
      if (! Type.isObject(spec)) {
        debugger;
      }
      
      var specWithUid = supplyUid(spec);

      var schemas = PartType.schemas(partTypes);
      
      var detail = SpecSchema.asStructOrDie(owner, schema, specWithUid, schemas.required(), schemas.optional());
       
      // This is the point where internal parts are created (internal and optional)
      var components = PartType.components(owner, detail, partTypes);
      var externals = PartType.externals(owner, detail, partTypes);

      return Merger.deepMerge(
        spec,
        factory(detail, components, specWithUid, externals)
      );
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