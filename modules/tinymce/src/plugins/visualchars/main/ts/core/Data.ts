import { Obj } from '@ephox/katamari';

type CharMap = Record<string, string>;

export const charMap: CharMap = {
  '\u00a0': 'nbsp',
  '\u00ad': 'shy'
};

export const charMapToRegExp = (charMap: CharMap, global?: boolean): RegExp => {
  let regExp = '';

  Obj.each(charMap, (_value, key) => {
    regExp += key;
  });

  return new RegExp('[' + regExp + ']', global ? 'g' : '');
};

export const charMapToSelector = (charMap: CharMap): string => {
  let selector = '';
  Obj.each(charMap, (value) => {
    if (selector) {
      selector += ',';
    }
    selector += 'span.mce-' + value;
  });

  return selector;
};

export const regExp = charMapToRegExp(charMap);
export const regExpGlobal = charMapToRegExp(charMap, true);
export const selector = charMapToSelector(charMap);
export const nbspClass = 'mce-nbsp';
