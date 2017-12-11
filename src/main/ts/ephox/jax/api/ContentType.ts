import { Adt } from '@ephox/katamari';

var adt = Adt.generate([
  { file: [ 'data' ] },
  { form: [ 'data' ] },
  { json: [ 'data' ] },
  { plain: [ 'data' ] },
  { html: [ 'data' ] }
]);

export default <any> {
  file: adt.file,
  form: adt.form,
  json: adt.json,
  plain: adt.plain,
  html: adt.html
};