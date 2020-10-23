import { Arr, Optional, Type, Unicode } from '@ephox/katamari';

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

const getMatchIndex = (match: RegExpMatchArray | null): Optional<number> =>
  Type.isNonNullable(match) && match.index !== undefined && match.index >= 0 ? Optional.some(match.index) : Optional.none();

const previous = (text: string, offsetOption: Optional<number>): Optional<CharPos> => {
  const max = offsetOption.getOr(text.length);
  for (let i = max - 1; i >= 0; i--) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Optional.some(locate(text, i));
    }
  }
  return Optional.none<CharPos>();
};

const next = (text: string, offsetOption: Optional<number>): Optional<CharPos> => {
  const min = offsetOption.getOr(0);
  for (let i = min + 1; i < text.length; i++) {
    if (text.charAt(i) !== Unicode.zeroWidth) {
      return Optional.some(locate(text, i));
    }
  }
  return Optional.none<CharPos>();
};

const rfind = (str: string, regex: RegExp): Optional<number> => {
  regex.lastIndex = -1;
  const reversed = Arr.reverse(str).join('');
  return getMatchIndex(reversed.match(regex)).map((index) => (reversed.length - 1) - index);
};

const lfind = (str: string, regex: RegExp): Optional<number> => {
  regex.lastIndex = -1;
  return getMatchIndex(str.match(regex));
};

export {
  previous,
  next,
  rfind,
  lfind
};
