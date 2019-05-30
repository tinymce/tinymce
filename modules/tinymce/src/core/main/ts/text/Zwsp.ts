/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

/**
 * Utility functions for working with zero width space
 * characters used as character containers etc.
 *
 * @private
 * @class tinymce.text.Zwsp
 * @example
 * var isZwsp = Zwsp.isZwsp('\uFEFF');
 * var abc = Zwsp.trim('a\uFEFFc');
 */

// This is technically not a ZWSP but a ZWNBSP or a BYTE ORDER MARK it used to be a ZWSP
const ZWSP = '\uFEFF';
const isZwsp = (chr: string) => chr === ZWSP;
const trim = (text: string) => text.replace(new RegExp(ZWSP, 'g'), '');

export default {
  isZwsp,
  ZWSP,
  trim
};