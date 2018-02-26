import { Adt } from '@ephox/katamari';
export interface ProcessorType {
  fold: (...args: any[]) => any;
  match: (branches: {any}) => any;
  log: (label: string) => string;
}

const typeAdt = Adt.generate([
  { setOf: [ 'validator', 'valueType' ] },
  { arrOf: [ 'valueType' ] },
  { objOf: [ 'fields' ] },
  { itemOf: [ 'validator' ] },
  { choiceOf: [ 'key', 'branches' ] },
  { thunk: [ 'description' ] },
  { func: [ 'args', 'outputSchema' ] }
]);

const fieldAdt = Adt.generate([
  { field: [ 'name', 'presence', 'type' ] },
  { state: [ 'name' ] }
]);

export {
  typeAdt,
  fieldAdt
};