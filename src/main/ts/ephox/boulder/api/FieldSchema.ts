import FieldPresence from './FieldPresence';
import ValueProcessor, { AdtFieldType } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';
import { Type } from '@ephox/katamari';

var strict = function (key:string):AdtFieldType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

var strictOf = function (key:string, schema:any):AdtFieldType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};

var strictFunction:any = function (key:string):AdtFieldType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

var forbid = function (key:string, message:string):AdtFieldType {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

var strictObjOf = function (key, objSchema) {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.obj(objSchema));
};

var strictArrayOfObj = function (key, objFields) {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

var option = function (key) {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

var optionOf = function (key, schema) {
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

var optionObjOf = function (key, objSchema) {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.obj(objSchema));
};

var optionObjOfOnly = function (key, objSchema: AdtFieldType[]) {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOnly(objSchema));
};

var defaulted = function (key, fallback) {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

var defaultedOf = function (key, fallback, schema) {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

var defaultedObjOf = function (key, fallback, objSchema) {
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.obj(objSchema));
};

var field = function (key, okey, presence, prop) {
  return ValueProcessor.field(key, okey, presence, prop);
};

var state = function (okey, instantiator) {
  return ValueProcessor.state(okey, instantiator);
};

export default <any> {
  strict: strict,
  strictOf: strictOf,
  strictObjOf: strictObjOf,
  strictArrayOfObj: strictArrayOfObj,
  strictFunction: strictFunction,

  forbid: forbid,

  option: option,
  optionOf: optionOf,
  optionObjOf: optionObjOf,
  optionObjOfOnly: optionObjOfOnly,

  defaulted: defaulted,
  defaultedOf: defaultedOf,
  defaultedObjOf: defaultedObjOf,

  field: field,
  state: state
};