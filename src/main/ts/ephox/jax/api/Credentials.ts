import { Adt } from '@ephox/katamari';

export interface Credentials extends Adt {
  fold: <T>(
    noneHandler: () => T,
    xhrHandler: () => T,
  ) => T;
  match: <T>(branches: {
    none: () => T,
    xhr: () => T
  }) => T;
};

const adt: {
  none: () => Credentials;
  xhr: () => Credentials;
} = Adt.generate([
  { none: [ ] },
  { xhr: [ ] }
]);

export const Credentials = {
  none: adt.none,
  xhr: adt.xhr
};