import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { get: [ ] },
  { post: [ ] },
  { put: [ ] },
  { del: [ ] }
]);

export default <any> {
  get: adt.get,
  post: adt.post,
  put: adt.put,
  del: adt.del
};