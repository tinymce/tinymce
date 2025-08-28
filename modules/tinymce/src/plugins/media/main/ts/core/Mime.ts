import { Obj } from '@ephox/katamari';

const guess = (url: string): string => {
  const mimes: Record<string, string> = {
    mp3: 'audio/mpeg',
    m4a: 'audio/x-m4a',
    wav: 'audio/wav',
    mp4: 'video/mp4',
    webm: 'video/webm',
    ogg: 'video/ogg',
    swf: 'application/x-shockwave-flash'
  };
  const fileEnd = url.toLowerCase().split('.').pop() ?? '';
  return Obj.get(mimes, fileEnd).getOr('');
};

export {
  guess
};
