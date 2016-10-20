define(
  'ephox.alloy.spec.SpecSchema',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (FieldPresence, FieldSchema, Objects, ValueSchema, Obj, Merger, Fun, Result) {
    var base = function (label, factories, spec) {
      return [
        FieldSchema.strict('uid'),
        FieldSchema.defaulted('library', { }),
        FieldSchema.field(
          'components',
          'components',
          FieldPresence.defaulted([ ]),
          ValueSchema.arrOf(
            ValueSchema.valueOf(function (compSpec) {
              if (compSpec.uiType !== 'dependent') return Result.value(Fun.constant(compSpec));
              else {
                debugger;
                var library = Objects.readOptFrom(spec, 'library').getOr({ });              
                var merged = Merger.deepMerge(factories, library);
                return Objects.readOptFrom(merged, compSpec.name).fold(function () {
                  return Result.error('Dependent component: ' + compSpec.name + ' not in library by ' + label + '\nLibrary has: [' + Obj.keys(merged).join(', ') + ']');
                }, function (factory) {
                  return Result.value(
                    Fun.curry(factory, compSpec)
                  );
                });
              }
            })
          )
        )
      ];
    };


    var asRawOrDie = function (label, schema, spec, factories) {
      var baseS = base(label, factories, spec);
      return ValueSchema.asRawOrDie(label + 'spec', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var asStructOrDie = function (label, schema, spec, factories) {
      var baseS = base(label, factories, spec);
      return ValueSchema.asStructOrDie(label + 'spec', ValueSchema.objOf(baseS.concat(schema)), spec);
    };

    var extend = function (builder, original, nu) {
      var o = Objects.readOptFrom(original, 'library').getOr({ });
      var n = Objects.readOptFrom(nu, 'library').getOr({ });
      var library = Merger.deepMerge(o, n);
      // Merge all at the moment.
      var newSpec = Merger.deepMerge(original, nu, {
        library: library
      });

      return builder(newSpec);
    };

    
    return {
      asRawOrDie: asRawOrDie,
      asStructOrDie: asStructOrDie,
      extend: extend
    };
  }
);