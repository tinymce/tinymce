import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';

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

const base = (partSchemas: FieldProcessor[], partUidsSchemas: FieldProcessor[]) => {
  const ps = partSchemas.length > 0 ? [
    FieldSchema.requiredObjOf('parts', partSchemas)
  ] : [ ];

  return ps.concat([
    FieldSchema.required('uid'),
    FieldSchema.defaulted('dom', { }), // Maybe get rid of.
    FieldSchema.defaulted('components', [ ]),
    Fields.snapshot('originalSpec'),
    FieldSchema.defaulted('debug.sketcher', { })
  ]).concat(partUidsSchemas);
};

const asRawOrDie = <D extends BaseSketchDetail<any>, S extends BaseSketchSpec>(label: string, schema: FieldProcessor[], spec: S, partSchemas: FieldProcessor[], partUidsSchemas: FieldProcessor[]): D => {
  const baseS = base(partSchemas, partUidsSchemas);
  return StructureSchema.asRawOrDie(label + ' [SpecSchema]', StructureSchema.objOfOnly(baseS.concat(schema)), spec);
};

export {
  asRawOrDie
};
