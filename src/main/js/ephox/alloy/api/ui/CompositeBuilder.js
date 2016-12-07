define(
  'ephox.alloy.api.ui.CompositeBuilder',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, Merger, Fun) {
    var build = function (owner, schema,  partTypes, factory, f, preprocess) {
      var p = preprocess !== undefined ? preprocess : Fun.identity;
      var parts = PartType.generate(owner, partTypes);
     

      var spec = p(f(parts));
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      var schemas = PartType.schemas(partTypes);

      var detail = SpecSchema.asStructOrDie(owner, schema, userSpec, schemas.required(), schemas.optional());
      
      var components = PartType.components(owner, detail, partTypes);

      var externals = PartType.externals(owner, detail, partTypes);

      return Merger.deepMerge(
        spec,
        factory(detail, components, userSpec, externals)
      );
    };

    return {
      build: build
    };
  }
);