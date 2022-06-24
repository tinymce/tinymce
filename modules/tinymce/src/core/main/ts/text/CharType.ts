import { Unicode } from '@ephox/katamari';

const is = (expected: string) => (actual: string): boolean =>
  expected === actual;

const isNbsp = is(Unicode.nbsp);

const isWhiteSpace = (chr: string): boolean =>
  chr !== '' && ' \f\n\r\t\v'.indexOf(chr) !== -1;

const isContent = (chr: string): boolean =>
  !isWhiteSpace(chr) && !isNbsp(chr) && !Unicode.isZwsp(chr);

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
