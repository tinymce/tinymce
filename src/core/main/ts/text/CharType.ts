/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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
