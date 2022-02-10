/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

const processRanges = (editor, ranges: Range[]): Range[] => Arr.map(ranges, (range) => {
  const evt = editor.dispatch('GetSelectionRange', { range });
  return evt.range !== range ? evt.range : range;
});

export {
  processRanges
};
