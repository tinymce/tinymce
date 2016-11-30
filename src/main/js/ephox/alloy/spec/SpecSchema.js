define(
  'ephox.alloy.spec.SpecSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'global!Error'
  ],

  function (FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Json, Error) {
    var getPartsSchema = function (partNames) {
      if (partNames.length === 0) return [ ];

      // temporary hacking
      var partsSchema = FieldSchema.strictObjOf('parts', Arr.map(partNames, FieldSchema.strict));

      var partUidsSchema = FieldSchema.state(
        'partUids',
        function (spec) {
          if (! Objects.hasKey(spec, 'parts')) throw new Error(
            'Part uid definition requires "parts"\nSpec: ' +
            Json.stringify(spec, null, 2)
          );
          var uids = Obj.map(spec.parts, function (v, k) {
            return Objects.readOptFrom(v, 'uid').getOrThunk(function () {
              return spec.uid + '-' + k;
            });
          });
          return uids;
        }
      );

      return [ partsSchema, partUidsSchema ];
    };

    var base = function (label, partNames, spec) {
      var partsSchema = getPartsSchema(partNames);

      return partsSchema.concat([
        FieldSchema.strict('uid'),
        FieldSchema.defaulted('components', [ ])
      ]);
    };


    var asRawOrDie = function (label, schema, spec, partNames) {

      var baseS = base(label, partNames, spec);
      return ValueSchema.asRawOrDie(label + ' [SpecSchema]', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var asStructOrDie = function (label, schema, spec, partNames) {
      var baseS = base(label, partNames, spec);
      return ValueSchema.asStructOrDie(label + ' [SpecSchema]', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var extend = function (builder, original, nu) {
      // Merge all at the moment.
      var newSpec = Merger.deepMerge(original, nu);
      return builder(newSpec);
    };

    var addBehaviours = function (original, behaviours) {
      return Merger.deepMerge(original, behaviours);
    };

    
    return {
      asRawOrDie: asRawOrDie,
      asStructOrDie: asStructOrDie,
      addBehaviours: addBehaviours,

      getPartsSchema: getPartsSchema,
      extend: extend
    };
  }
);