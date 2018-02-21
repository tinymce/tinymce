import FieldPresence from './FieldPresence';
import ValueProcessor, { ValueAdtType } from '../core/ValueProcessor';
import { Result } from '@ephox/katamari';
import { Type } from '@ephox/katamari';

var strict = function (key:string):ValueAdtType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.anyValue());
};

var strictOf = function (key:string, schema:any):ValueAdtType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), schema);
};

var strictFunction:any = function (key:string):ValueAdtType {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.value(function (f) {
    return Type.isFunction(f) ? Result.value(f) : Result.error('Not a function');
  }));
};

var forbid = function (key:string, message:string):ValueAdtType {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.asOption(),
    ValueProcessor.value(function (v) {
      return Result.error('The field: ' + key + ' is forbidden. ' + message);
    })
  );
};

var strictObjOf = function (key:string, objSchema:any[]):ValueAdtType  {
  return ValueProcessor.field(key, key, FieldPresence.strict(), ValueProcessor.obj(objSchema));
};

var strictArrayOfObj = function (key:string, objFields:any[]):ValueAdtType {
  return ValueProcessor.field(
    key,
    key,
    FieldPresence.strict(),
    ValueProcessor.arrOfObj(objFields)
  );
};

var option = function (key:string):ValueAdtType {
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.anyValue());
};

var optionOf = function (key:string, schema:ValueAdtType[]):ValueAdtType { // TODO: no test coverage
   return ValueProcessor.field(key, key, FieldPresence.asOption(), schema);
};

var optionObjOf = function (key:string, objSchema:ValueAdtType[]):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.obj(objSchema));
};

var optionObjOfOnly = function (key:string, objSchema: ValueAdtType[]):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, key, FieldPresence.asOption(), ValueProcessor.objOnly(objSchema));
};

var defaulted = function (key:string, fallback:string):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.anyValue());
};

var defaultedOf = function (key:string, fallback:string, schema:ValueAdtType[]):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), schema);
};

var defaultedObjOf = function (key:string, fallback:string, objSchema:ValueAdtType[]):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, key, FieldPresence.defaulted(fallback), ValueProcessor.obj(objSchema));
};

var field = function (key:string, okey:string, presence:()=>object, prop):ValueAdtType { // TODO: no test coverage
  return ValueProcessor.field(key, okey, presence, prop);
};

var state = function (okey:string, instantiator:()=>any):ValueAdtType {
  return ValueProcessor.state(okey, instantiator);
};

export default {
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