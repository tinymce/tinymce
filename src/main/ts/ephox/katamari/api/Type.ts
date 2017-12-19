var typeOf = function(x) {
  if (x === null) return 'null';
  var t = typeof x;
  if (t === 'object' && Array.prototype.isPrototypeOf(x)) return 'array';
  if (t === 'object' && String.prototype.isPrototypeOf(x)) return 'string';
  return t;
};

var isType = function (type) {
  return function (value) {
    return typeOf(value) === type;
  };
};

export default <any> {
  isString: isType('string'),
  isObject: isType('object'),
  isArray: isType('array'),
  isNull: isType('null'),
  isBoolean: isType('boolean'),
  isUndefined: isType('undefined'),
  isFunction: isType('function'),
  isNumber: isType('number')
};