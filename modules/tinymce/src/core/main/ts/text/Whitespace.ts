import { Arr, Strings, Unicode } from '@ephox/katamari';

const whiteSpaceRegExp = /^[ \t\r\n]*$/;

const isWhitespaceText = (text: string): boolean => whiteSpaceRegExp.test(text);

const isZwsp = (text: string): boolean => {
  for (const c of text) {
    if (!Unicode.isZwsp(c)) {
      return false;
    }
  }
  return true;
};

// Don't compare other unicode spaces here, as we're only concerned about whitespace the browser would collapse
const isCollapsibleWhitespace = (c: string): boolean => ' \f\t\v'.indexOf(c) !== -1;
const isNewLineChar = (c: string): boolean => c === '\n' || c === '\r';
const isNewline = (text: string, idx: number): boolean => (idx < text.length && idx >= 0) ? isNewLineChar(text[idx]) : false;

// Converts duplicate whitespace to alternating space/nbsps and tabs to spaces
const normalize = (text: string, tabSpaces: number = 4, isStartOfContent: boolean = true, isEndOfContent: boolean = true): string => {
  // Replace tabs with a variable amount of spaces
  // Note: We don't use an actual tab character here, as it only works when in a "whitespace: pre" element,
  // which will cause other issues, such as trying to type the content will also be treated as being in a pre.
  const tabSpace = Strings.repeat(' ', tabSpaces);
  const normalizedText = text.replace(/\t/g, tabSpace);

  const result = Arr.foldl(normalizedText, (acc, c) => {
    // Are we dealing with a char other than some collapsible whitespace or nbsp? if so then just use it as is
    if (isCollapsibleWhitespace(c) || c === Unicode.nbsp) {
      // If the previous char is a space, we are at the start or end, or if the next char is a new line char, then we need
      // to convert the space to a nbsp
      if (acc.pcIsSpace || (acc.str === '' && isStartOfContent) || (acc.str.length === normalizedText.length - 1 && isEndOfContent) || isNewline(normalizedText, acc.str.length + 1)) {
        return { pcIsSpace: false, str: acc.str + Unicode.nbsp };
      } else {
        return { pcIsSpace: true, str: acc.str + ' ' };
      }
    } else {
      // Treat newlines as being a space, since we'll need to convert any leading spaces to nsbps
      return { pcIsSpace: isNewLineChar(c), str: acc.str + c };
    }
  }, { pcIsSpace: false, str: '' });

  return result.str;
};

export {
  isWhitespaceText,
  isZwsp,
  isNewline,
  normalize
};
