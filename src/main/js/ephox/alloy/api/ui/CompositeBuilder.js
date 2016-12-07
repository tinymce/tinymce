define(
  'ephox.alloy.api.ui.CompositeBuilder',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.highway.Merger'
  ],

  function (PartType, Tagger, SpecSchema, Merger) {
    var build = function (owner, schema,  partTypes, factory, f) {
      var parts = PartType.generate(owner, partTypes);
     

      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      var schemas = PartType.schemas(partTypes);

      var detail = SpecSchema.asStructOrDie(owner, schema, userSpec, schemas.required(), schemas.optional());

      var components = PartType.components(owner, detail, partTypes);

      return Merger.deepMerge(
        spec,
        factory(detail, components)
      );
    };

    return {
      build: build
    };
  }
);