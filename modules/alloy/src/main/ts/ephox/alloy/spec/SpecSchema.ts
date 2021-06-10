import { StructureProcessor, FieldSchema, ValueSchema } from '@ephox/boulder';

import { AlloySpec, OptionalDomSchema } from '../api/component/SpecTypes';
import * as Fields from '../data/Fields';

export interface BaseSketchSpec {
  uid?: string;
}

export interface BaseSketchDetail<T extends BaseSketchSpec> {
  uid: string;
  components: AlloySpec[];
  dom: OptionalDomSchema;
  originalSpec: T;
  'debug.sketcher': { };
}

const base = (partSchemas: StructureProcessor[], partUidsSchemas: StructureProcessor[]) => {
  const ps = partSchemas.length > 0 ? [
    FieldSchema.strictObjOf('parts', partSchemas)
  ] : [ ];

  return ps.concat([
    FieldSchema.strict('uid'),
    FieldSchema.defaulted('dom', { }), // Maybe get rid of.
    FieldSchema.defaulted('components', [ ]),
    Fields.snapshot('originalSpec'),
    FieldSchema.defaulted('debug.sketcher', { })
  ]).concat(partUidsSchemas);
};

const asRawOrDie = <D extends BaseSketchDetail<any>, S extends BaseSketchSpec>(label: string, schema: StructureProcessor[], spec: S, partSchemas: StructureProcessor[], partUidsSchemas: StructureProcessor[]): D => {
  const baseS = base(partSchemas, partUidsSchemas);
  return ValueSchema.asRawOrDie(label + ' [SpecSchema]', ValueSchema.objOfOnly(baseS.concat(schema)), spec);
};

export {
  asRawOrDie
};
