import { console } from '@ephox/dom-globals';
import { Merger, Obj } from '@ephox/katamari';

import * as ArbSchema from './ArbSchema';
import * as ArbSchemaTypes from './ArbSchemaTypes';

const unknownDepth = undefined;

const makeArbOf = (component, schema, depth): any => {
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

const createSchema = (factory, extras): any => {
  const base = ArbSchema;
  const schema = Merger.deepMerge(base, extras);
  return Obj.map(schema, (s, k) => {
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

const arbOf = (component, _schema?) => {
  // For the schema to create other components;
  const constructor = (comp, newDepth) => makeArbOf(comp, schema, newDepth);

  const factory = ArbSchemaTypes.create(constructor);
  const extras = _schema !== undefined ? _schema : { };
  const schema = createSchema(factory, extras);

  return makeArbOf(component, schema, unknownDepth);
};

export {
  arbOf
};
