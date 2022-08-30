import { FieldProcessor } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';

import * as AlloyParts from '../../parts/AlloyParts';
import { PartTypeAdt } from '../../parts/PartType';
import * as Tagger from '../../registry/Tagger';
import * as SpecSchema from '../../spec/SpecSchema';
import { AlloySpec, SketchSpec } from '../component/SpecTypes';
import { CompositeSketchDetail, CompositeSketchSpec, SingleSketchDetail, SingleSketchSpec } from './Sketcher';

export type SingleSketchFactory<D extends SingleSketchDetail, S extends SingleSketchSpec> = (detail: D, specWithUid: S) => SketchSpec;
export type CompositeSketchFactory<D extends CompositeSketchDetail, S extends CompositeSketchSpec> = (detail: D, components: AlloySpec[], spec: S, externals: any) => SketchSpec;

const single = <D extends SingleSketchDetail, S extends SingleSketchSpec>(owner: string, schema: FieldProcessor[], factory: SingleSketchFactory<D, S>, spec: S): SketchSpec => {
  const specWithUid = supplyUid<S>(spec);
  const detail = SpecSchema.asRawOrDie<D, S>(owner, schema, specWithUid, [ ], [ ]);
  return factory(detail, specWithUid);
};

const composite = <D extends CompositeSketchDetail, S extends CompositeSketchSpec>(owner: string, schema: FieldProcessor[], partTypes: PartTypeAdt[], factory: CompositeSketchFactory<D, S>, spec: S): SketchSpec => {
  const specWithUid = supplyUid(spec);

  // Identify any information required for external parts
  const partSchemas = AlloyParts.schemas(partTypes);

  // Generate partUids for all parts (external and otherwise)
  const partUidsSchema = AlloyParts.defaultUidsSchema(partTypes);

  const detail = SpecSchema.asRawOrDie<D, S>(owner, schema, specWithUid, partSchemas, [ partUidsSchema ]);

  // Create (internals, externals) substitutions
  const subs = AlloyParts.substitutes(owner, detail, partTypes);

  // Work out the components by substituting internals
  const components = AlloyParts.components(owner, detail, subs.internals());

  return factory(detail, components, specWithUid, subs.externals());
};

const hasUid = <S>(spec: S): spec is S & { uid: string } => Obj.has(spec as any, 'uid');

const supplyUid = <S>(spec: S): S & { uid: string } => {
  return hasUid(spec) ? spec : {
    ...spec,
    uid: Tagger.generate('uid')
  };
};

export {
  supplyUid,
  single,
  composite
};
