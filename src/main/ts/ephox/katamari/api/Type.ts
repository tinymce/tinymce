var typeOf = function(x: any) {
  if (x === null) return 'null';
  var t = typeof x;
  if (t === 'object' && Array.prototype.isPrototypeOf(x)) return 'array';
  if (t === 'object' && String.prototype.isPrototypeOf(x)) return 'string';
  return t;
};

var isType = function (type: string) {
  return function (value: any) {
    return typeOf(value) === type;
  };
};

export default {
  isString: <(value: any) => value is string>isType('string'),
  isObject: <(value: any) => value is object>isType('object'),
  isArray: <(value: any) => value is Array<any>>isType('array'),
  isNull: <(value: any) => value is null>isType('null'),
  isBoolean: <(value: any) => value is boolean>isType('boolean'),
  isUndefined: <(value: any) => value is undefined>isType('undefined'),
  isFunction: <(value: any) => value is Function>isType('function'),
  isNumber: <(value: any) => value is number>isType('number')
};