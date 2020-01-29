/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { Unicode } from '@ephox/katamari';

const is = (expected: string) => (actual: string) => expected === actual;

const isNbsp = is(Unicode.nbsp);

const isWhiteSpace = (chr: string) => chr !== '' && ' \f\n\r\t\v'.indexOf(chr) !== -1;

const isContent = (chr: string) => !isWhiteSpace(chr) && !isNbsp(chr);

export {
  isNbsp,
  isWhiteSpace,
  isContent
};
