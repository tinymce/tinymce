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

    var subDependent = function (_owner, detail, compSpec, factories, placeholders) {
      return Objects.readOptFrom(factories, compSpec.name).fold(function () {
        throw new Error('Unknown dependent component: ' + compSpec.name + '\nKnown: [' +
          Obj.keys(factories) + ']\nSpec: ' + Json.stringify(compSpec, null, 2)
        );
      }, function (builder) {
        var output = builder(compSpec, detail);
        return adt.single(output);
      });
    };

    var subPlaceholder = function (owner, detail, compSpec, factories, placeholders) {
      if (owner.exists(function (o) { return o !== compSpec.owner; })) return adt.single(compSpec);
      // Ignore having to find something for the time being.
      return Objects.readOptFrom(placeholders, compSpec.name).fold(function () {
        throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + 
          Obj.keys(placeholders) + ']\nSpec: ' + Json.stringify(compSpec, null, 2)
        );
      }, function (newSpec) {
        // Must return a single/multiple type
        return newSpec.replace();
      });
    };

    var scan = function (owner, detail, compSpec, factories, placeholders) {
      if (compSpec.uiType === dependent) return subDependent(owner, detail, compSpec, factories, placeholders);
      else if (compSpec.uiType === placeholder) return subPlaceholder(owner, detail, compSpec, factories, placeholders);
      else return adt.single(compSpec);
    };

    var substitute = function (owner, detail, compSpec, factories, placeholders) {
      var base = scan(owner, detail, compSpec, factories, placeholders);
      
      return base.fold(
        function (value) {
          var childSpecs = Objects.readOptFrom(value, 'components').getOr([ ]);
          var substituted = Arr.bind(childSpecs, function (c) {
            return substitute(owner, detail, c, factories, placeholders);
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

    var substituteAll = function (owner, detail, components, factories, placeholders) {
      return Arr.bind(components, function (c) {
        return substitute(owner, detail, c, factories, placeholders);
      });
    };

    var oneReplace = function (label, replacements) {
      var called = false;

      var used = function () {
        return called;
      };

      var replace = function () {
        if (called === true) throw new Error(
          'Trying to use the same placeholder more than once: ' + label
        );
        called = true;
        return replacements;
      };

      return {
        name: Fun.constant(label),
        required: Fun.constant(true),
        used: used,
        replace: replace
      };
    };

    var substitutePlaces = function (owner, detail, components, placeholders) {
      var ps = Obj.map(placeholders, function (ph, name) {
        return oneReplace(name, ph);
      });

      var outcome = substituteAll(owner, detail, components, { }, ps);

      Obj.each(ps, function (p) {
        if (p.used() === false && p.required()) throw new Error(
          'Placeholder: ' + p.name() + ' was not found in components list\nComponents: ' +
          Json.stringify(detail.components(), null, 2)
        );
      });

      return outcome;
    };

    return {
      single: adt.single,
      multiple: adt.multiple,
      isSubstitute: isSubstitute,
      dependent: Fun.constant(dependent),
      placeholder: Fun.constant(placeholder),
      substituteAll: substituteAll,
      substitutePlaces: substitutePlaces
    };
  }
);