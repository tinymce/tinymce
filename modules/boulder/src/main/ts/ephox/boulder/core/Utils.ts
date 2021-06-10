import { SimpleResult } from '../alien/SimpleResult';
import * as SchemaError from './SchemaError';
import { StructureProcessor, ValueValidator } from './StructureProcessor';

const value = (validator: ValueValidator): StructureProcessor => {
  const extract = (path, val) => {
    return SimpleResult.bindError(
      validator(val),
      (err) => SchemaError.custom(path, err)
    );
  };

  const toString = () => 'val';

  return {
    getProp: extract,
    toString
  };
};

const _anyValue: StructureProcessor = value(SimpleResult.svalue);

export {
  _anyValue,
  value
};