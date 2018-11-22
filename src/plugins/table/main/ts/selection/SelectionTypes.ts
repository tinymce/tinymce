/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt } from '@ephox/katamari';

const type = Adt.generate([
  { none: [] },
  { multiple: [ 'elements' ] },
  { single: [ 'selection' ] }
]);

const cata = function (subject, onNone, onMultiple, onSingle) {
  return subject.fold(onNone, onMultiple, onSingle);
};

export default {
  cata,
  none: type.none,
  multiple: type.multiple,
  single: type.single
};