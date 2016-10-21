define(
  'ephox.alloy.spec.UiSubstitutes',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.scullion.ADT',
    'global!Error'
  ],

  function (Objects, Arr, Obj, Merger, Json, Fun, Adt, Error) {
    var dependent = 'dependent';
    var placeholder = 'placeholder';

    var adt = Adt.generate([
      { single: [ 'value' ] },
      { multiple: [ 'values' ] }
    ]);

    var isSubstitute = function (uiType) {
      return Arr.contains([
        dependent,
        placeholder
      ], uiType);
    };

    var subDependent = function (detail, compSpec, factories, placeholders) {
      return Objects.readOptFrom(factories, compSpec.name).fold(function () {
        throw new Error('Unknown dependent component: ' + compSpec.name + '\nKnown: [' +
          Obj.keys(factories) + ']\nSpec: ' + Json.stringify(compSpec, null, 2)
        );
      }, function (builder) {
        var output = builder(compSpec, detail);
        return adt.single(output);
      });
    };

    var subPlaceholder = function (detail, compSpec, factories, placeholders) {
      // Ignore having to find something for the time being.
      return Objects.readOptFrom(placeholders, compSpec.name).fold(function () {
        throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + 
          Obj.keys(placeholders) + ']\nSpec: ' + Json.stringify(compSpec, null, 2)
        );
      }, function (newSpec) {
        // Must return a single/multiple type
        return newSpec;
      });
    };

    var scan = function (detail, compSpec, factories, placeholders) {
      if (compSpec.uiType === dependent) return subDependent(detail, compSpec, factories, placeholders);
      else if (compSpec.uiType === placeholder) return subPlaceholder(detail, compSpec, factories, placeholders);
      else return adt.single(compSpec);
    };

    var substitute = function (detail, compSpec, factories, placeholders) {
      var base = scan(detail, compSpec, factories, placeholders);
      
      return base.fold(
        function (value) {
          var childSpecs = Objects.readOptFrom(value, 'components').getOr([ ]);
          var substituted = Arr.bind(childSpecs, function (c) {
            return substitute(detail, c, factories, placeholders);
          });
          return [
            Merger.deepMerge(value, {
              components: substituted
            })
          ];
        },
        function (values) {
          return values;
        }
      );
    };

    var substituteAll = function (detail, components, factories, placeholders) {
      var dd = Arr.bind(components, function (c) {
        return substitute(detail, c, factories, placeholders);
      });
      // Everything should have a UI Type.
      debugger;
      return dd;
    };

    return {
      single: adt.single,
      multiple: adt.multiple,
      isSubstitute: isSubstitute,
      dependent: Fun.constant(dependent),
      placeholder: Fun.constant(placeholder),
      substituteAll: substituteAll
    };
  }
);