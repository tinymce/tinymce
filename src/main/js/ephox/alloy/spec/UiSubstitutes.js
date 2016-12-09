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
    var placeholder = 'placeholder';

    var adt = Adt.generate([
      { single: [ 'required', 'valueThunk' ] },
      { multiple: [ 'required', 'valueThunks' ] }
    ]);

    var isSubstitute = function (uiType) {
      return Arr.contains([
        placeholder
      ], uiType);
    };

    var subPlaceholder = function (owner, detail, compSpec, placeholders) {
      if (owner.exists(function (o) { return o !== compSpec.owner; })) return adt.single(true, Fun.constant(compSpec));
      // Ignore having to find something for the time being.
      return Objects.readOptFrom(placeholders, compSpec.name).fold(function () {
        throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' + 
          Obj.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + Json.stringify(compSpec, null, 2)
        );
      }, function (newSpec) {
        // Must return a single/multiple type
        return newSpec.replace();
      });
    };

    var scan = function (owner, detail, compSpec, placeholders) {
      if (compSpec.uiType === placeholder) return subPlaceholder(owner, detail, compSpec, placeholders);
      else return adt.single(false, Fun.constant(compSpec));
    };

    var substitute = function (owner, detail, compSpec, placeholders) {
      var base = scan(owner, detail, compSpec, placeholders);
      
      return base.fold(
        function (req, valueThunk) {
          var value = valueThunk(detail);
          var childSpecs = Objects.readOptFrom(value, 'components').getOr([ ]);
          var substituted = Arr.bind(childSpecs, function (c) {
            return substitute(owner, detail, c, placeholders);
          });
          return [
            Merger.deepMerge(value, {
              components: substituted
            })
          ];
        },
        function (req, valuesThunk) {
          var values = valuesThunk(detail);
          return values;
        }
      );
    };

    var substituteAll = function (owner, detail, components, placeholders) {
      return Arr.bind(components, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
    };

    var oneReplace = function (label, replacements) {
      if (! Objects.hasKey(replacements, 'fold')) {
        debugger;
      }
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

      var required = function () {
        return replacements.fold(function (req, _) {
          return req;
        }, function (req, _) {
          return req;
        });
      };

      return {
        name: Fun.constant(label),
        required: required,
        used: used,
        replace: replace
      };
    };

    var substitutePlaces = function (owner, detail, components, placeholders) {
      var ps = Obj.map(placeholders, function (ph, name) {
        return oneReplace(name, ph);
      });

      var outcome = substituteAll(owner, detail, components, ps);

      Obj.each(ps, function (p) {
        if (p.used() === false && p.required()) {
          debugger;
          throw new Error(
            'Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' +
            Json.stringify(detail.components(), null, 2)
          );
        }
      });

      return outcome;
    };

    return {
      single: adt.single,
      multiple: adt.multiple,
      isSubstitute: isSubstitute,
      placeholder: Fun.constant(placeholder),
      substituteAll: substituteAll,
      substitutePlaces: substitutePlaces
    };
  }
);