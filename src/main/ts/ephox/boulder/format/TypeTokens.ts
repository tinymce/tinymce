import { Adt } from '@ephox/katamari';

var typeAdt = Adt.generate([
  { setOf: [ 'validator', 'valueType' ] },
  { arrOf: [ 'valueType' ] },
  { objOf: [ 'fields' ] },
  { itemOf: [ 'validator' ] },
  { choiceOf: [ 'key', 'branches' ] },
  { thunk: [ 'description' ] },
  { func: [ 'args', 'outputSchema' ] }
]);

var fieldAdt = Adt.generate([
  { field: [ 'name', 'presence', 'type' ] },
  { state: [ 'name' ] }
]);

export default <any> {
  typeAdt: typeAdt,
  fieldAdt: fieldAdt
};