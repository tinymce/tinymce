import { Arr, Option, Unicode } from '@ephox/katamari';

export interface CharPos {
  readonly ch: string;
  readonly offset: number;
}

const charpos = (ch: string, offset: number): CharPos => ({
  ch,
  offset
});

const locate = (text: string, offset: number): CharPos =>
  charpos(text.charAt(offset), offset);

const previous = (text: string, offsetOption: Option<number>): Option<CharPos> => {
  const max = offsetOption.getOr(text.length);
  for (let i = max - 1; i >= 0; i--) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Option.some(locate(text, i));
    }
  }
  return Option.none<CharPos>();
};

const next = (text: string, offsetOption: Option<number>): Option<CharPos> => {
  const min = offsetOption.getOr(0);
  for (let i = min + 1; i < text.length; i++) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Option.some(locate(text, i));
    }
  }
  return Option.none<CharPos>();
};

const rfind = (str: string, regex: RegExp): Option<number> => {
  regex.lastIndex = -1;
  const reversed = Arr.reverse(str).join('');
  const match = reversed.match(regex);
  return match !== undefined && match !== null && match.index !== undefined && match.index >= 0 ? Option.some((reversed.length - 1) - match.index) : Option.none<number>();
};

const lfind = (str: string, regex: RegExp): Option<number> => {
  regex.lastIndex = -1;
  const match = str.match(regex);
  return match !== undefined && match !== null && match.index !== undefined && match.index >= 0 ? Option.some(match.index) : Option.none<number>();
};

export {
  previous,
  next,
  rfind,
  lfind
};
