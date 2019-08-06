import { Arr, Obj, Type } from '@ephox/katamari';

const formatObj = function (input) {
  return Type.isObject(input) && Obj.keys(input).length > 100 ? ' removed due to size' : JSON.stringify(input, null, 2);

};

const formatErrors = function (errors) {
  const es = errors.length > 10 ? errors.slice(0, 10).concat([
    {
      path: [ ],
      getErrorInfo () {
        return '... (only showing first ten failures)';
      }
    }
  ]) : errors;

  // TODO: Work out a better split between PrettyPrinter and SchemaError
  return Arr.map(es, function (e) {
    return 'Failed path: ('  + e.path.join(' > ') + ')\n' + e.getErrorInfo();
  });
};

export {
  formatObj,
  formatErrors
};