import { Arr, Option, Struct, Unicode } from '@ephox/katamari';

export interface CharPos {
  ch: () => string;
  offset: () => number;
}

const charpos: (ch: string, offset: number) => CharPos = Struct.immutable('ch', 'offset');

const locate = function (text: string, offset: number) {
  return charpos(text.charAt(offset), offset);
};

const previous = function (text: string, offsetOption: Option<number>) {
  const max = offsetOption.getOr(text.length);
  for (let i = max - 1; i >= 0; i--) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Option.some(locate(text, i));
    }
  }
  return Option.none<CharPos>();
};

const next = function (text: string, offsetOption: Option<number>) {
  const min = offsetOption.getOr(0);
  for (let i = min + 1; i < text.length; i++) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Option.some(locate(text, i));
    }
  }
  return Option.none<CharPos>();
};

const rfind = function (str: string, regex: RegExp) {
  regex.lastIndex = -1;
  const reversed = Arr.reverse(str).join('');
  const match = reversed.match(regex);
  return match !== undefined && match !== null && match.index !== undefined && match.index >= 0 ? Option.some((reversed.length - 1) - match.index) : Option.none<number>();
};

const lfind = function (str: string, regex: RegExp) {
  regex.lastIndex = -1;
  const match = str.match(regex);
  return match !== undefined && match !== null && match.index !== undefined && match.index >= 0 ? Option.some(match.index) : Option.none<number>();
};

export const TextSearch = {
  previous,
  next,
  rfind,
  lfind
};
