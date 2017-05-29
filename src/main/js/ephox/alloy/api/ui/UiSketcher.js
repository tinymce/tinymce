define(
  'ephox.alloy.api.ui.UiSketcher',

  [
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger'
  ],

  function (AlloyParts, Tagger, SpecSchema, Objects, Merger) {
    var single = function (owner, schema, factory, spec) {
      var specWithUid = supplyUid(spec);
      var detail = SpecSchema.asStructOrDie(owner, schema, specWithUid, [ ], [ ]);
      return Merger.deepMerge(
        factory(detail, specWithUid),
        { 'debug.sketcher': Objects.wrap(owner, spec) }
      );
    };

    var composite = function (owner, schema, partTypes, factory, spec) {
      var specWithUid = supplyUid(spec);

      // Identify any information required for external parts
      var partSchemas = AlloyParts.schemas(partTypes);

      // Generate partUids for all parts (external and otherwise)
      var partUidsSchema = AlloyParts.defaultUidsSchema(partTypes);

      var detail = SpecSchema.asStructOrDie(owner, schema, specWithUid, partSchemas, [ partUidsSchema ]);

      // Create (internals, externals) substitutions
      var subs = AlloyParts.substitutes(owner, detail, partTypes);

      // Work out the components by substituting internals
      var components = AlloyParts.components(owner, detail, subs.internals());

      return Merger.deepMerge(
        // Pass through the substituted components and the externals
        factory(detail, components, specWithUid, subs.externals()),
        { 'debug.sketcher': Objects.wrap(owner, spec) }
      );
    };


    var supplyUid = function (spec) {
      return Merger.deepMerge(
        {
          uid: Tagger.generate('uid')
        }, spec
      );
    };

    return {
      supplyUid: supplyUid,
      single: single,
      composite: composite
    };
  }
);