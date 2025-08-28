import { Arr, Obj } from '@ephox/katamari';

import Env from 'tinymce/core/api/Env';

// Converts shortcut format to Mac/PC variants
const convertText = (source: string): string => {
  const isMac = Env.os.isMacOS() || Env.os.isiOS();
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
  const replace: Record<string, string> = isMac ? mac : other;

  const shortcut = source.split('+');

  const updated = Arr.map(shortcut, (segment: string) => {
    // search lowercase, but if not found use the original
    const search = segment.toLowerCase().trim();
    return Obj.has(replace, search) ? replace[search] : segment;
  });

  return isMac ? (updated.join('')).replace(/\s/, '') : updated.join('+');
};

export {
  convertText
};
