import { Objects } from '@ephox/boulder';
import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';
import { Fun } from '@ephox/katamari';
import { Adt } from '@ephox/katamari';

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
      var value = valueThunk(detail, compSpec.config, compSpec.validated);
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
      var values = valuesThunk(detail, compSpec.config, compSpec.validated);
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
      throw new Error(
        'Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' +
        Json.stringify(detail.components(), null, 2)
      );
    }
  });

  return outcome;
};

var singleReplace = function (detail, p) {
  var replacement = p;
  return replacement.fold(function (req, valueThunk) {
    return [ valueThunk(detail) ];
  }, function (req, valuesThunk) {
    return valuesThunk(detail);
  });
};

export default <any> {
  single: adt.single,
  multiple: adt.multiple,
  isSubstitute: isSubstitute,
  placeholder: Fun.constant(placeholder),
  substituteAll: substituteAll,
  substitutePlaces: substitutePlaces,

  singleReplace: singleReplace
};