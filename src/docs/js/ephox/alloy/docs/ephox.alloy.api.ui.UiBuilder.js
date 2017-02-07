define(
  'ephox.alloy.api.ui.UiSketcher',

  [
    'ephox.alloy.parts.PartType',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.classify.Type',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (PartType, Tagger, SpecSchema, FieldSchema, Type, Arr, Merger, Fun) {
    var single = function (owner, schema, factory, spec) {
      return {
        name: Fun.constant(owner),
        schema: Fun.constant(
          FieldSchema.strictObjOf(owner, schema)
        ),
        parts: Fun.constant([ ])
      };
    };

    var composite = function (owner, schema,  partTypes, factory, spec) {
      // { internal: [ 'factory', 'name', 'pname', 'defaults', 'overrides' ] },
      // { external: [ 'factory', 'name', 'defaults', 'overrides' ] },
      // { optional: [ 'factory', 'name', 'pname', 'defaults', 'overrides' ] },
      // { group: [ 'factory', 'name', 'unit', 'pname', 'defaults', 'overrides' ] }
      var parts = Arr.map(partTypes, function (pt) {
        return pt.fold(
          function (_, name, _, _, _) {
            return name;
          },
          function (_, name, _, _, _) {
            return name;
          },
          function (_, name, _, _, _) {
            return name;
          },
          function (_, name, _, _, _, _) {
            return name;
          }
        );
      });

      return {
        name: Fun.constant(owner),
        schema: Fun.constant(
          FieldSchema.strictObjOf(owner, schema)
        ),
        parts: Fun.constant(parts)
      };
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