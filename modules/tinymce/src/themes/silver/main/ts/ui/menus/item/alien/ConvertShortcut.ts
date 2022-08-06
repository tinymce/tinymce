import { Arr, Obj } from '@ephox/katamari';

import Env from 'tinymce/core/api/Env';

// Converts shortcut format to Mac/PC variants
// Note: This is different to the help shortcut converter, as it doesn't padd the + symbol with spaces
//       so as to not take up large amounts of space in the menus
const convertText = (source: string): string => {
  const isMac = Env.os.isMacOS() || Env.os.isiOS();
  const mac = {
    alt: '\u2325',
    ctrl: '\u2303',
    shift: '\u21E7',
    meta: '\u2318',
    access: '\u2303\u2325'
  };
  const other = {
    meta: 'Ctrl',
    access: 'Shift+Alt'
  };
  const replace: Record<string, string> = isMac ? mac : other;

  const shortcut = source.split('+');

  const updated = Arr.map(shortcut, (segment: string) => {
    // search lowercase, but if not found use the original
    const search = segment.toLowerCase().trim();
    return Obj.has(replace, search) ? replace[search] : segment;
  });

  return isMac ? updated.join('') : updated.join('+');
};

export {
  convertText
};
