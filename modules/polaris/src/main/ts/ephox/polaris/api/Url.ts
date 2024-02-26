import { Arr, Optional, Strings } from '@ephox/katamari';

// TINY-10350: A modification of the Regexes.link regex to specifically capture host.
// eslint-disable-next-line max-len
const hostCaptureRegex = /^(?:(?:(?:[A-Za-z][A-Za-z\d.+-]{0,14}:\/\/(?:[-.~*+=!&;:'%@?^${}(),\w]+@)?|www\.|[-;:&=+$,.\w]+@)([A-Za-z\d-]+(?:\.[A-Za-z\d-]+)*))(?::\d+)?(?:\/(?:[-.~*+=!;:'%@$(),\/\w]*[-~*+=%@$()\/\w])?)?(?:\?(?:[-.~*+=!&;:'%@?^${}(),\/\w]+)?)?(?:#(?:[-.~*+=!&;:'%@?^${}(),\/\w]+)?)?)$/;

const extractHost = (url: string): Optional<string> =>
  Optional.from(url.match(hostCaptureRegex)).bind((ms) => Arr.get(ms, 1)).map((h) => Strings.startsWith(h, 'www.') ? h.substring(4) : h);

export {
  extractHost
};
