import { Objects } from '@ephox/boulder';
import { Adt, Arr, Fun, Merger, Obj } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

const _placeholder = 'placeholder';

const adt = Adt.generate([
  { single: [ 'required', 'valueThunk' ] },
  { multiple: [ 'required', 'valueThunks' ] }
]);

const isSubstitute = function (uiType) {
  return Arr.contains([
    _placeholder
  ], uiType);
};

const subPlaceholder = function (owner, detail, compSpec, placeholders) {
  if (owner.exists(function (o) { return o !== compSpec.owner; })) { return adt.single(true, Fun.constant(compSpec)); }
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

const scan = function (owner, detail, compSpec, placeholders) {
  if (compSpec.uiType === _placeholder) {
    return subPlaceholder(owner, detail, compSpec, placeholders);
  } else {
    return adt.single(false, Fun.constant(compSpec));
  }
};

const substitute = function (owner, detail, compSpec, placeholders) {
  const base = scan(owner, detail, compSpec, placeholders);

  return base.fold(
    function (req, valueThunk) {
      const value = valueThunk(detail, compSpec.config, compSpec.validated);
      const childSpecs = Objects.readOptFrom(value, 'components').getOr([ ]);
      const substituted = Arr.bind(childSpecs, function (c) {
        return substitute(owner, detail, c, placeholders);
      });
      return [
        Merger.deepMerge(value, {
          components: substituted
        })
      ];
    },
    function (req, valuesThunk) {
      const values = valuesThunk(detail, compSpec.config, compSpec.validated);
      return values;
    }
  );
};

const substituteAll = function (owner, detail, components, placeholders) {
  return Arr.bind(components, function (c) {
    return substitute(owner, detail, c, placeholders);
  });
};

const oneReplace = function (label, replacements) {
  let called = false;

  const used = function () {
    return called;
  };

  const replace = function () {
    if (called === true) { throw new Error(
      'Trying to use the same placeholder more than once: ' + label
    );
    }
    called = true;
    return replacements;
  };

  const required = function () {
    return replacements.fold(function (req, _) {
      return req;
    }, function (req, _) {
      return req;
    });
  };

  return {
    name: Fun.constant(label),
    required,
    used,
    replace
  };
};

const substitutePlaces = function (owner, detail, components, placeholders) {
  const ps = Obj.map(placeholders, function (ph, name) {
    return oneReplace(name, ph);
  });

  const outcome = substituteAll(owner, detail, components, ps);

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

const singleReplace = function (detail, p) {
  const replacement = p;
  return replacement.fold(function (req, valueThunk) {
    return [ valueThunk(detail) ];
  }, function (req, valuesThunk) {
    return valuesThunk(detail);
  });
};

const single = adt.single;
const multiple = adt.multiple;
const placeholder = Fun.constant(_placeholder);

export default {
  single,
  multiple,
  isSubstitute,
  placeholder,
  substituteAll,
  substitutePlaces,
  singleReplace
};