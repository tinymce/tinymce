import { Arr, Fun, Obj, Type } from '@ephox/katamari';

const formatObj = (input: any): string => {
  return Type.isObject(input) && Obj.keys(input).length > 100 ? ' removed due to size' : JSON.stringify(input, null, 2);
};

const formatErrors = (errors: Array<{ path: string[]; getErrorInfo: () => string }>): string[] => {
  const es = errors.length > 10 ? errors.slice(0, 10).concat([
    {
      path: [ ],
      getErrorInfo: Fun.constant('... (only showing first ten failures)')
    }
  ]) : errors;

  // TODO: Work out a better split between PrettyPrinter and SchemaError
  return Arr.map(es, (e) => {
    return 'Failed path: (' + e.path.join(' > ') + ')\n' + e.getErrorInfo();
  });
};

export {
  formatObj,
  formatErrors
};
