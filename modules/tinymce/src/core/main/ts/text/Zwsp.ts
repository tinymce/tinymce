import { Unicode } from '@ephox/katamari';

/**
 * Utility functions for working with zero width space
 * characters used as character containers etc.
 *
 * @private
 * @class tinymce.text.Zwsp
 * @example
 * const isZwsp = Zwsp.isZwsp('\uFEFF');
 * const abc = Zwsp.trim('a\uFEFFc');
 */

// This is technically not a ZWSP but a ZWNBSP or a BYTE ORDER MARK it used to be a ZWSP
const ZWSP = Unicode.zeroWidth;
const isZwsp = Unicode.isZwsp;
const trim = Unicode.removeZwsp;

export {
  isZwsp,
  ZWSP,
  trim
};
