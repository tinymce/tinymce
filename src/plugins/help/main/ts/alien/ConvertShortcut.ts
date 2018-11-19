import { Arr, Obj } from '@ephox/katamari';
import Env from 'tinymce/core/api/Env';

// Converts shortcut format to Mac/PC variants
const convertText = (source: string) => {
  const mac = {
    alt: '&#x2325;',
    ctrl: 'Ctrl',
    shift: '&#x21E7;',
    meta: '&#x2318;'
  };
  const other = {
    meta: 'Ctrl'
  };
  const replace: Record<string, string> = Env.mac ? mac : other;

  const shortcut = source.split('+');

  const updated = Arr.map(shortcut, (segment: string) => {
    // search lowercase, but if not found use the original
    const search = segment.toLowerCase().trim();
    return Obj.has(replace, search) ? replace[search] : segment;
  });

  return updated.join('+');
};

export default { convertText };