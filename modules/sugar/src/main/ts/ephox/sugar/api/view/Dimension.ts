import { Arr, Optional } from '@ephox/katamari';

const units = {
  // we don't really support all of these different ways to express a length
  unsupportedLength: [
    'em' as 'em',
    'ex' as 'ex',
    'cap' as 'cap',
    'ch' as 'ch',
    'ic' as 'ic',
    'rem' as 'rem',
    'lh' as 'lh',
    'rlh' as 'rlh',
    'vw' as 'vw',
    'vh' as 'vh',
    'vi' as 'vi',
    'vb' as 'vb',
    'vmin' as 'vmin',
    'vmax' as 'vmax',
    'cm' as 'cm',
    'mm' as 'mm',
    'Q' as 'Q',
    'in' as 'in',
    'pc' as 'pc',
    'pt' as 'pt',
    'px' as 'px'
  ],
  // these are the length values we do support
  fixed: [ 'px' as 'px', 'pt' as 'pt' ],
  relative: [ '%' as '%' ],
  empty: [ '' as '' ]
};

type Units = {
  [K in keyof typeof units]: typeof units[K][number];
};

export interface Dimension<U extends keyof Units> {
  readonly value: number;
  readonly unit: Units[U];
}

// Built from https://tc39.es/ecma262/#prod-StrDecimalLiteral
// Matches a float followed by a trailing set of characters
const pattern: RegExp = (() => {
  const decimalDigits = '[0-9]+';
  const signedInteger = '[+-]?' + decimalDigits;
  const exponentPart = '[eE]' + signedInteger;
  const dot = '\\.';

  const opt = (input: string) => `(?:${input})?`;

  const unsignedDecimalLiteral = [
    'Infinity',
    decimalDigits + dot + opt(decimalDigits) + opt(exponentPart),
    dot + decimalDigits + opt(exponentPart),
    decimalDigits + opt(exponentPart)
  ].join('|');

  const float = `[+-]?(?:${unsignedDecimalLiteral})`;

  return new RegExp(`^(${float})(.*)$`);
})();

const isUnit = <T extends keyof Units>(unit: string, accepted: T[]): unit is Units[T] =>
  Arr.exists(accepted, (acc: T) =>
    Arr.exists(units[acc], (check) => unit === check)
  );

export const parse = <T extends keyof Units>(input: string, accepted: T[]): Optional<Dimension<T>> => {
  const match = Optional.from(pattern.exec(input));
  return match.bind((array) => {
    const value = Number(array[1]);
    const unitRaw = array[2];

    if (isUnit(unitRaw, accepted)) {
      return Optional.some({
        value,
        unit: unitRaw
      });
    } else {
      return Optional.none();
    }
  });
};

export const normalise = <T extends keyof Units>(input: string, accepted: T[]): Optional<string> =>
  parse(input, accepted).map(({ value, unit }) => value + unit);
