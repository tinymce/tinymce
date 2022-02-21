import { Arr, Optional, Optionals, Strings } from '@ephox/katamari';

export interface ListDetail {
  readonly start: string;
  readonly listStyleType: Optional<string>;
}

const enum ListType {
  UpperAlpha,
  LowerAlpha,
  Numeric,
  None,
  Unknown
}

// Example: 'AB' -> 28
const parseAlphabeticBase26 = (str: string): number => {
  const chars = Arr.reverse(Strings.trim(str).split(''));
  const values = Arr.map(chars, (char, i) => {
    const charValue = char.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0) + 1;
    return Math.pow(26, i) * charValue;
  });
  return Arr.foldl(values, (sum, v) => sum + v, 0);
};

// Example: 28 -> 'AB'
const composeAlphabeticBase26 = (value: number): string => {
  value--;
  if (value < 0) {
    return '';
  } else {
    const remainder = value % 26;
    const quotient = Math.floor(value / 26);

    const rest = composeAlphabeticBase26(quotient);
    const char = String.fromCharCode('A'.charCodeAt(0) + remainder);

    return rest + char;
  }
};

const isUppercase = (str: string): boolean => /^[A-Z]+$/.test(str);

const isLowercase = (str: string): boolean => /^[a-z]+$/.test(str);

const isNumeric = (str: string): boolean => /^[0-9]+$/.test(str);

const deduceListType = (start: string): ListType => {
  if (isNumeric(start)) {
    return ListType.Numeric;
  } else if (isUppercase(start)) {
    return ListType.UpperAlpha;
  } else if (isLowercase(start)) {
    return ListType.LowerAlpha;
  } else if (Strings.isEmpty(start)) {
    return ListType.None;
  } else {
    return ListType.Unknown;
  }
};

const parseStartValue = (start: string): Optional<ListDetail> => {
  switch (deduceListType(start)) {
    case ListType.Numeric:
      return Optional.some({
        listStyleType: Optional.none(),
        start
      });

    case ListType.UpperAlpha:
      return Optional.some({
        listStyleType: Optional.some('upper-alpha'),
        start: parseAlphabeticBase26(start).toString()
      });

    case ListType.LowerAlpha:
      return Optional.some({
        listStyleType: Optional.some('lower-alpha'),
        start: parseAlphabeticBase26(start).toString()
      });

    case ListType.None:
      return Optional.some({
        listStyleType: Optional.none(),
        start: ''
      });

    case ListType.Unknown:
      return Optional.none();
  }
};

const parseDetail = (detail: ListDetail): string => {
  const start = parseInt(detail.start, 10);

  if (Optionals.is(detail.listStyleType, 'upper-alpha')) {
    return composeAlphabeticBase26(start);
  } else if (Optionals.is(detail.listStyleType, 'lower-alpha')) {
    return composeAlphabeticBase26(start).toLowerCase();
  } else {
    return detail.start;
  }
};

export {
  parseStartValue,
  parseDetail
};
