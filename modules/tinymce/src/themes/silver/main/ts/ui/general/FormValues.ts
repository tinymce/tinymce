import { Obj, Optional, Result } from '@ephox/katamari';

const toValidValues = <T>(values: Record<string, Optional<T>>): Result<Record<string, T>, string[]> => {
  const errors: string[] = [];
  const result: Record<string, T> = {};

  Obj.each(values, (value: Optional<T>, name: string) => {
    value.fold(() => {
      errors.push(name);
    }, (v) => {
      result[name] = v;
    });
  });

  return errors.length > 0 ? Result.error<Record<string, T>, string[]>(errors) :
    Result.value<Record<string, T>, string[]>(result);
};

export {
  toValidValues
};
