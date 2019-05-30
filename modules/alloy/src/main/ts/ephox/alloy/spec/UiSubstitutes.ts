import { Objects } from '@ephox/boulder';
import { Adt, Arr, Fun, Merger, Obj } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

const _placeholder = 'placeholder';

const adt: {
  single: (required: boolean, valueThunk: Function) => Adt;
  multiple: (required: boolean, valueThunk: Function) => Adt;
} = Adt.generate([
  { single: [ 'required', 'valueThunk' ] },
  { multiple: [ 'required', 'valueThunks' ] }
]);

const isSubstitute = (uiType) => {
  return Arr.contains([
    _placeholder
  ], uiType);
};

const subPlaceholder = (owner, detail, compSpec, placeholders) => {
  if (owner.exists((o) => o !== compSpec.owner)) { return adt.single(true, Fun.constant(compSpec)); }
  // Ignore having to find something for the time being.
  return Objects.readOptFrom<{ replace: () => any}>(placeholders, compSpec.name).fold(() => {
    throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' +
      Obj.keys(placeholders) + ']\nNamespace: ' + owner.getOr('none') + '\nSpec: ' + Json.stringify(compSpec, null, 2)
    );
  }, (newSpec) => {
    // Must return a single/multiple type
    return newSpec.replace();
  });
};

const scan = (owner, detail, compSpec, placeholders) => {
  if (compSpec.uiType === _placeholder) {
    return subPlaceholder(owner, detail, compSpec, placeholders);
  } else {
    return adt.single(false, Fun.constant(compSpec));
  }
};

const substitute = (owner, detail, compSpec, placeholders) => {
  const base = scan(owner, detail, compSpec, placeholders);

  return base.fold(
    (req, valueThunk) => {
      const value = valueThunk(detail, compSpec.config, compSpec.validated);
      const childSpecs = Objects.readOptFrom<any[]>(value, 'components').getOr([ ]);
      const substituted = Arr.bind(childSpecs, (c) => {
        return substitute(owner, detail, c, placeholders);
      });
      return [
        {
          ...value,
          components: substituted
        }
      ];
    },
    (req, valuesThunk) => {
      const values = valuesThunk(detail, compSpec.config, compSpec.validated);
      // Allow a preprocessing step for groups before returning the components
      const preprocessor = compSpec.validated.preprocess.getOr(Fun.identity);
      return preprocessor(values);
    }
  );
};

const substituteAll = (owner, detail, components, placeholders) => {
  return Arr.bind(components, (c) => {
    return substitute(owner, detail, c, placeholders);
  });
};

const oneReplace = (label, replacements) => {
  let called = false;

  const used = () => {
    return called;
  };

  const replace = () => {
    if (called === true) { throw new Error(
      'Trying to use the same placeholder more than once: ' + label
    );
    }
    called = true;
    return replacements;
  };

  const required = () => {
    return replacements.fold((req, _) => {
      return req;
    }, (req, _) => {
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

const substitutePlaces = (owner, detail, components, placeholders) => {
  const ps = Obj.map(placeholders, (ph, name) => {
    return oneReplace(name, ph);
  });

  const outcome = substituteAll(owner, detail, components, ps);

  Obj.each(ps, (p) => {
    if (p.used() === false && p.required()) {
      throw new Error(
        'Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner.getOr('none') + '\nComponents: ' +
        Json.stringify(detail.components, null, 2)
      );
    }
  });

  return outcome;
};

const singleReplace = (detail, p) => {
  const replacement = p;
  return replacement.fold((req, valueThunk) => {
    return [ valueThunk(detail) ];
  }, (req, valuesThunk) => {
    return valuesThunk(detail);
  });
};

const single = adt.single;
const multiple = adt.multiple;
const placeholder = Fun.constant(_placeholder);

export {
  single,
  multiple,
  isSubstitute,
  placeholder,
  substituteAll,
  substitutePlaces,
  singleReplace
};