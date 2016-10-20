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
        FieldSchema.field(
          'components',
          'components',
          FieldPresence.defaulted([ ]),
          ValueSchema.arrOf(
            ValueSchema.anyValue()
            // ValueSchema.valueOf(function (compSpec) {
            //   if (compSpec.uiType !== 'dependent') return Result.value(Fun.constant(compSpec));
            //   else {
            //     return Objects.readOptFrom(factories, compSpec.name).fold(function () {
            //       return Result.error('Dependent component: ' + compSpec.name + ' not in library by ' + label + '\nLibrary has: [' + Obj.keys(factories).join(', ') + ']');
            //     }, function (factory) {
            //       return Result.value(
            //         Fun.curry(factory, compSpec)
            //       );
            //     });
            //   }
            // })
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
      // Merge all at the moment.
      var newSpec = Merger.deepMerge(original, nu);
      return builder(newSpec);
    };

    
    return {
      asRawOrDie: asRawOrDie,
      asStructOrDie: asStructOrDie,
      extend: extend
    };
  }
);