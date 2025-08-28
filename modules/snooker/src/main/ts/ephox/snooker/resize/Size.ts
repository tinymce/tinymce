import { Adt, Strings } from '@ephox/katamari';

export interface Size {
  fold: <T> (
    invalid: (raw: string) => T,
    pixels: (value: number) => T,
    percent: (value: number) => T
  ) => T;
  match: <T> (branches: {
    invalid: (raw: string) => T;
    pixels: (value: number) => T;
    percent: (value: number) => T;
  }) => T;
  log: (label: string) => void;
}

const adt: {
  invalid: (raw: string) => Size;
  pixels: (value: number) => Size;
  percent: (value: number) => Size;
} = Adt.generate([
  { invalid: [ 'raw' ] },
  { pixels: [ 'value' ] },
  { percent: [ 'value' ] }
]);

const validateFor = (suffix: string, type: (value: number) => Size, value: string): Size => {
  const rawAmount = value.substring(0, value.length - suffix.length);
  const amount = parseFloat(rawAmount);
  return rawAmount === amount.toString() ? type(amount) : adt.invalid(value);
};

const from = (value: string): Size => {
  if (Strings.endsWith(value, '%')) {
    return validateFor('%', adt.percent, value);
  }
  if (Strings.endsWith(value, 'px')) {
    return validateFor('px', adt.pixels, value);
  }
  return adt.invalid(value);
};

export const Size = {
  ...adt,
  from
};
