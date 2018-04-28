/**
 * SelectionTypes.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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