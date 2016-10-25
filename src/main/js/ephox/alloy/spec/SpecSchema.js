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
    'global!Error'
  ],

  function (FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Error) {
    var getPartsSchema = function (partNames) {
      if (partNames.length === 0) return [ ];

      // temporary hacking
      var partsSchema = FieldSchema.field(
        'parts',
        'parts',
        FieldPresence.strict(),
        ValueSchema.objOf(
          Arr.map(partNames, FieldSchema.strict)
        )
      );

      var partUidsSchema = FieldSchema.state(
        'partUids',
        function (spec) {
          if (! Objects.hasKey(spec, 'parts')) throw new Error('Part uid definition requires "parts"');
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
        FieldSchema.field(
          'components',
          'components',
          FieldPresence.defaulted([ ]),
          ValueSchema.arrOf(
            ValueSchema.anyValue()
          )
        )
      ]);
    };


    var asRawOrDie = function (label, schema, spec, partNames) {

      var baseS = base(label, partNames, spec);
      return ValueSchema.asRawOrDie(label + 'spec', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var asStructOrDie = function (label, schema, spec, partNames) {
      var baseS = base(label, partNames, spec);
      return ValueSchema.asStructOrDie(label + 'spec', ValueSchema.objOf(baseS.concat(schema)), spec);
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
      extend: extend
    };
  }
);