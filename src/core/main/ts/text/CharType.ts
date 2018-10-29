/**
 * CharType.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const is = (expected: string) => (actual: string) => expected === actual;

const isNbsp = is('\u00a0');

const isWhiteSpace = (chr: string) => /^[\r\n\t ]$/.test(chr);

const isContent = (chr: string) => !isWhiteSpace(chr) && !isNbsp(chr);

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
