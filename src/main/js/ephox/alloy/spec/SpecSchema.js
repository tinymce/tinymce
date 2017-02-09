define(
  'ephox.alloy.spec.SpecSchema',

  [
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (UiSubstitutes, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Json, Fun, Error) {
    var getPartsSchema = function (partNames, _optPartNames, _owner) {
      var owner = _owner !== undefined ? _owner : 'Unknown owner';
      var fallbackThunk = function () {
        return [
          FieldSchema.state('partUids', function () {
            return { };
          })
        ];
      };

      var optPartNames = _optPartNames !== undefined ? _optPartNames : fallbackThunk();
      if (partNames.length === 0 && optPartNames.length === 0) return fallbackThunk();

      // temporary hacking
      var partsSchema = FieldSchema.strictObjOf(
        'parts',
        Arr.flatten([
          Arr.map(partNames, FieldSchema.strict),
          Arr.map(optPartNames, function (optPart) {
            return FieldSchema.defaulted(optPart, UiSubstitutes.single(false, function () {
              throw new Error('The optional part: ' + optPart + ' was not specified in the config, but it was used in components');
            }));
          })
        ])
      );

      var partUidsSchema = FieldSchema.state(
        'partUids',
        function (spec) {
          if (! Objects.hasKey(spec, 'parts')) {
            throw new Error(
              'Part uid definition for owner: ' + owner + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' +
              Json.stringify(spec, null, 2)
            );
          }
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

    var getPartUidsSchema = function (label, spec) {
      return FieldSchema.state(
        'partUids',
        function (spec) {
          if (! Objects.hasKey(spec, 'parts')) {
            throw new Error(
              'Part uid definition for owner: ' + label + ' requires "parts"\nExpected parts: ' + partNames.join(', ') + '\nSpec: ' +
              Json.stringify(spec, null, 2)
            );
          }
          var uids = Obj.map(spec.parts, function (v, k) {
            return Objects.readOptFrom(v, 'uid').getOrThunk(function () {
              return spec.uid + '-' + k;
            });
          });
          return uids;
        }
      );
    };

    var base = function (label, partSchemas, spec) {
      var ps = partSchemas.length > 0 ? 
        [
          FieldSchema.strictObjOf('parts', partSchemas),
          getPartUidsSchema(label, spec)
        ] : [ ];

      return ps.concat([
        FieldSchema.strict('uid'),
        FieldSchema.defaulted('dom', { }), // Maybe get rid of.
        FieldSchema.defaulted('components', [ ]),
        FieldSchema.state('originalSpec', Fun.identity)
      ]);
    };


    var asRawOrDie = function (label, schema, spec, partSchemas) {

      var baseS = base(label, partSchemas, spec);
      return ValueSchema.asRawOrDie(label + ' [SpecSchema]', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var asStructOrDie = function (label, schema, spec, partSchemas) {
      var baseS = base(label, partSchemas, spec);
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