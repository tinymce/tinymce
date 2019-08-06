import { console } from '@ephox/dom-globals';
import { Merger, Obj } from '@ephox/katamari';

import ArbSchema from './ArbSchema';
import ArbSchemaTypes from './ArbSchemaTypes';

const unknownDepth = undefined;

const makeArbOf = function (component, schema, depth) {
  const arbitrary = schema[component];
  if (arbitrary === undefined) {
    const message =
      'Did not understand arbitrary schema element: ' + JSON.stringify(component) +
      '. Known schema elements were: ' + JSON.stringify(Obj.keys(schema));
    // tslint:disable-next-line:no-console
    console.error(message);
    throw new Error(message);
  }
  return arbitrary(depth);
};

const createSchema = function (factory, extras) {
  const base = ArbSchema;
  const schema = Merger.deepMerge(base, extras);
  return Obj.map(schema, function (s, k) {
    const type = s.type;
    if (factory[type] === undefined && base[k] !== undefined) {
      throw new Error('Component: ' + k + ' has invalid type: ' + type);
    // deprecate `custom` function
    } else if (factory[type] === undefined) {
      return factory.custom(s);
    } else {
      return factory[type](s);
    }
  });
};

const arbOf = function (component, _schema?) {
  // For the schema to create other components;
  const constructor = function (comp, newDepth) {
    return makeArbOf(comp, schema, newDepth);
  };

  const factory = ArbSchemaTypes(constructor);
  const extras = _schema !== undefined ? _schema : { };
  const schema = createSchema(factory, extras);

  return makeArbOf(component, schema, unknownDepth);
};

export default {
  arbOf
};
