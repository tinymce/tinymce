import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { none: [ ] },
  { xhr: [ ] }
]);

export default <any> {
  none: adt.none,
  xhr: adt.xhr
};