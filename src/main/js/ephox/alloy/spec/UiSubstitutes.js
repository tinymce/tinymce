define(
  'ephox.alloy.spec.UiSubstitutes',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'global!Error'
  ],

  function (Objects, Arr, Obj, Merger, Json, Fun, Error) {
    var dependent = 'dependent';
    var placeholder = 'placeholder';

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
        return builder(compSpec, detail);
      });
    };

    var subPlaceholder = function (detail, compSpec, factories, placeholders) {
      debugger;
      return compSpec;
    };

    var scan = function (detail, compSpec, factories, placeholders) {
      if (compSpec.uiType === dependent) return subDependent(detail, compSpec, factories, placeholders);
      else if (compSpec.uiType === placeholder) return subPlaceholder(detail, compSpec, factories, placeholders);
      else return compSpec;
    };

    var substitute = function (detail, compSpec, factories, placeholders) {
      var base = isSubstitute(compSpec.uiType) ? scan(detail, compSpec, factories, placeholders) : compSpec;
      var childSpecs = Objects.readOptFrom(base, 'components').getOr([ ]);
      var substituted = Arr.map(childSpecs, function (c) {
        return substitute(detail, c, factories, placeholders);
      });

      return Merger.deepMerge(base, {
        components: substituted
      });
    };

    var substituteAll = function (detail, components, factories, placeholders) {
      return Arr.map(components, function (c) {
        return substitute(detail, c, factories, placeholders);
      });
    };

    return {
      isSubstitute: isSubstitute,
      dependent: Fun.constant(dependent),
      placeholder: Fun.constant(placeholder),
      substitute: substitute,
      substituteAll: substituteAll
    };
  }
);