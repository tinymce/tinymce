import ArbSchema from './ArbSchema';
import ArbSchemaTypes from './ArbSchemaTypes';
import { Obj } from '@ephox/katamari';
import { Merger } from '@ephox/katamari';
import { JSON as Json } from '@ephox/sand';

var unknownDepth = undefined;

var makeArbOf = function (component, schema, depth) {
  var arbitrary = schema[component];
  if (arbitrary === undefined) {
    var message =
      'Did not understand arbitrary schema element: ' + Json.stringify(component) +
      '. Known schema elements were: ' + Json.stringify(Obj.keys(schema));
    console.error(message);
    throw new Error(message);
  }
  return arbitrary(depth);
};

var createSchema = function (factory, extras) {
  var base = ArbSchema;
  var schema = Merger.deepMerge(base, extras);
  return Obj.map(schema, function (s, k) {
    var type = s.type;
    if (factory[type] === undefined && base[k] !== undefined) throw new Error('Component: ' + k + ' has invalid type: ' + type);
    // deprecate `custom` function
    else if (factory[type] === undefined) return factory.custom(s);
    else return factory[type](s);
  });
};

var arbOf = function (component, _schema?) {
  // For the schema to create other components;
  var constructor = function (comp, newDepth) {
    return makeArbOf(comp, schema, newDepth);
  };

  var factory = ArbSchemaTypes(constructor);
  var extras = _schema !== undefined ? _schema : { };
  var schema = createSchema(factory, extras);

  return makeArbOf(component, schema, unknownDepth);
};

export default {
  arbOf: arbOf
};