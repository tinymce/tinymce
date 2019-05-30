/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Data from './Data';

const wrapCharWithSpan = function (value) {
  return '<span data-mce-bogus="1" class="mce-' + Data.charMap[value] + '">' + value + '</span>';
};

export default {
  wrapCharWithSpan
};