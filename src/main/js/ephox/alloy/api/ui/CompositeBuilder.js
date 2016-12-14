define(
  'ephox.alloy.api.ui.CompositeBuilder',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.classify.Type',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, Type, Obj, Merger, Fun) {
    var build = function (owner, schema,  partTypes, factory, spec, preprocess) {
      if (! Type.isObject(spec)) {
        debugger;
      }
      var p = preprocess !== undefined ? preprocess : Fun.identity;
      
      var spec = p(spec);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      console.log('userSpec', userSpec);

      console.log('partTypes', partTypes);
      var schemas = PartType.schemas(partTypes);
      console.log('schemas', schemas);


      var detail = SpecSchema.asStructOrDie(owner, schema, userSpec, schemas.required(), schemas.optional());
       
      // This is the point where internal parts are created (internal and optional)
      var components = PartType.components(owner, detail, partTypes);


      var externals = PartType.externals(owner, detail, partTypes);

      return Merger.deepMerge(
        spec,
        factory(detail, components, userSpec, externals)
      );
    };

    var partial = function (owner, schema,  partTypes, factory, f, preprocess) {
      var p = preprocess !== undefined ? preprocess : Fun.identity;
      var parts = PartType.generate(owner, partTypes);
     

      var spec = p(f(parts));
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      return userSpec;
    };

    return {
      build: build,
      partial: partial
    };
  }
);