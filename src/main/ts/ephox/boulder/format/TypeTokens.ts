import { Adt } from '@ephox/katamari';
import { AdtInterface } from '../alien/AdtDefinition';
export interface TypeProcessorAdt extends AdtInterface {
  // TODO: extend the correct fold type
  // fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
}

export interface FieldProcessorAdt extends AdtInterface {
  // TODO: extend the correct fold type
  // fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
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