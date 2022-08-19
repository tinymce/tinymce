import { Obj, Optional, Optionals, Result } from '@ephox/katamari';

export type SizeUnit = '' | 'cm' | 'mm' | 'in' | 'px' | 'pt' | 'pc' | 'em' | 'ex' | 'ch' | 'rem' | 'vw' | 'vh' | 'vmin' | 'vmax' | '%';

export interface Size {
  value: number;
  unit: SizeUnit;
}

export const nuSize = (value: number, unit: SizeUnit): Size => {
  return { value, unit };
};

export const formatSize = (size: Size): string => {
  const unitDec: Record<string, number> = {
    '': 0,
    'px': 0,
    'pt': 1,
    'mm': 1,
    'pc': 2,
    'ex': 2,
    'em': 2,
    'ch': 2,
    'rem': 2,
    'cm': 3,
    'in': 4,
    '%': 4
  };
  const maxDecimal = (unit: SizeUnit) => unit in unitDec ? unitDec[unit] : 1;
  let numText = size.value.toFixed(maxDecimal(size.unit));
  if (numText.indexOf('.') !== -1) {
    numText = numText.replace(/\.?0*$/, '');
  }
  return numText + size.unit;
};

export const parseSize = (sizeText: string): Result<Size, string> => {
  const numPattern = /^\s*(\d+(?:\.\d+)?)\s*(|cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)\s*$/;
  const match = numPattern.exec(sizeText);
  if (match !== null) {
    const value = parseFloat(match[1]);
    const unit = match[2] as SizeUnit;
    return Result.value({ value, unit });
  } else {
    return Result.error(sizeText);
  }
};

export const convertUnit = (size: Size, unit: SizeUnit): Optional<number> => {
  const inInch: Record<string, number> = {
    '': 96,
    'px': 96,
    'pt': 72,
    'cm': 2.54,
    'pc': 12,
    'mm': 25.4,
    'in': 1
  };
  const supported = (u: SizeUnit) => Obj.has(inInch, u);

  if (size.unit === unit) {
    return Optional.some(size.value);
  } else if (supported(size.unit) && supported(unit)) {
    if (inInch[size.unit] === inInch[unit]) {
      return Optional.some(size.value);
    } else {
      return Optional.some(size.value / inInch[size.unit] * inInch[unit]);
    }
  } else {
    return Optional.none();
  }
};

export type SizeConversion = (input: Size) => Optional<Size>;

export const noSizeConversion: SizeConversion = (_input: Size) => Optional.none();

export const ratioSizeConversion = (scale: number, unit: SizeUnit): SizeConversion =>
  (size: Size) => convertUnit(size, unit).map((value) => ({ value: value * scale, unit }));

export const makeRatioConverter = (currentFieldText: string, otherFieldText: string): SizeConversion => {
  const cValue = parseSize(currentFieldText).toOptional();
  const oValue = parseSize(otherFieldText).toOptional();
  return Optionals.lift2(cValue, oValue, (cSize: Size, oSize: Size) => convertUnit(cSize, oSize.unit).map((val) => oSize.value / val).map(
    (r) => ratioSizeConversion(r, oSize.unit)
  ).getOr(noSizeConversion)).getOr(noSizeConversion);
};
