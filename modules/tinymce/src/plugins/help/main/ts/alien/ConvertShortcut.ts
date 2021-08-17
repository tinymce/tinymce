/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Obj } from '@ephox/katamari';

import Env from 'tinymce/core/api/Env';

// Converts shortcut format to Mac/PC variants
const convertText = (source: string): string => {
  const mac = {
    alt: '&#x2325;',
    ctrl: '&#x2303;',
    shift: '&#x21E7;',
    meta: '&#x2318;',
    access: '&#x2303;&#x2325;'
  };
  const other = {
    meta: 'Ctrl ',
    access: 'Shift + Alt '
  };
  const replace: Record<string, string> = Env.mac ? mac : other;

  const shortcut = source.split('+');

  const updated = Arr.map(shortcut, (segment: string) => {
    // search lowercase, but if not found use the original
    const search = segment.toLowerCase().trim();
    return Obj.has(replace, search) ? replace[search] : segment;
  });

  return Env.mac ? (updated.join('')).replace(/\s/, '') : updated.join('+');
};

export {
  convertText
};
