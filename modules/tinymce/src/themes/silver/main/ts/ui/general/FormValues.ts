import { Obj, Optional, Result } from '@ephox/katamari';

const toValidValues = <T> (values: { [key: string]: Optional<T[keyof T]> }) => {
  const errors: string[] = [];
  const result: { [key: string]: T[keyof T] } = {};

  Obj.each(values, (value: Optional<T[keyof T]>, name: string) => {
    value.fold(() => {
      errors.push(name);
    }, (v) => {
      result[name] = v;
    });
  });

  return errors.length > 0 ? Result.error<{ [key: string]: T[keyof T] }, string[]>(errors) :
    Result.value<{ [key: string]: T[keyof T] }, string[]>(result);
};

export {
  toValidValues
};
