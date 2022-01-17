import { Merger, Obj } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import * as fc from 'fast-check';

import { ArbSchema } from './ArbSchema';
import { Schema, SchemaDetail } from './ArbSchemaTypes';
import * as ArbSchemaTypes from './ArbSchemaTypes';

interface ContentSchema {
  [key: string]: <T extends Node>(rawDepth: number | undefined) => fc.Arbitrary<SugarElement<T>>;
}

const unknownDepth = undefined;

const makeArbOf = <T extends Node>(component: string, schema: ContentSchema, depth: number | undefined): fc.Arbitrary<SugarElement<T>> => {
  const arbitrary = schema[component];
  if (arbitrary === undefined) {
    const message =
      'Did not understand arbitrary schema element: ' + JSON.stringify(component) +
      '. Known schema elements were: ' + JSON.stringify(Obj.keys(schema));
    // eslint-disable-next-line no-console
    console.error(message);
    throw new Error(message);
  }
  return arbitrary(depth);
};

const createSchema = (factory: Schema, extras: Record<string, Partial<SchemaDetail>>): ContentSchema => {
  const base = ArbSchema;
  const schema = Merger.deepMerge(base, extras);
  return Obj.map(schema, (s, k) => {
    const type: string = s.type;
    if (factory[type] === undefined && base[k] !== undefined) {
      throw new Error('Component: ' + k + ' has invalid type: ' + type);
    } else {
      return factory[type](s);
    }
  });
};

const arbOf = <T extends Node>(component: string, extras: Record<string, Partial<SchemaDetail>> = {}): fc.Arbitrary<SugarElement<T>> => {
  // For the schema to create other components;
  const constructor = (comp: string, newDepth: number) => makeArbOf(comp, schema, newDepth);

  const factory = ArbSchemaTypes.create(constructor);
  const schema = createSchema(factory, extras);

  return makeArbOf(component, schema, unknownDepth);
};

export {
  arbOf
};
