import { Unicode } from '@ephox/katamari';

const is = (expected: string) => (actual: string) => expected === actual;

const isNbsp = is(Unicode.nbsp);

const isWhiteSpace = (chr: string) => chr !== '' && ' \f\n\r\t\v'.indexOf(chr) !== -1;

const isContent = (chr: string) => !isWhiteSpace(chr) && !isNbsp(chr) && !Unicode.isZwsp(chr);

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
