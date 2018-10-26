const is = (expected: string) => (actual: string) => expected === actual;

const isNbsp = is('\u00a0');

const isWhiteSpace = (chr: string) => /^[\r\n\t ]$/.test(chr);

const isContent = (chr: string) => !isWhiteSpace(chr) && !isNbsp(chr);

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
