import { Objects } from '@ephox/boulder';
import { Merger, Adt } from '@ephox/katamari';
import {
  CompositeSketchDetail,
  CompositeSketchSpec,
  SingleSketchDetail,
  SingleSketchSpec,
} from '../../api/ui/Sketcher';

import { AlloySpec, SketchSpec } from '../../api/component/SpecTypes';
import * as AlloyParts from '../../parts/AlloyParts';
import * as Tagger from '../../registry/Tagger';
import * as SpecSchema from '../../spec/SpecSchema';

export type SingleSketchFactory<D extends SingleSketchDetail, S extends SingleSketchSpec> = (detail: D, specWithUid: S) => SketchSpec;
export type CompositeSketchFactory<D extends CompositeSketchDetail, S extends CompositeSketchSpec> = (detail: D, components: AlloySpec[], spec: S, externals: any) => SketchSpec;

const single = function <D extends SingleSketchDetail, S extends SingleSketchSpec>(owner: string, schema: Adt[], factory: SingleSketchFactory<D, S>, spec: S): SketchSpec {
  const specWithUid = supplyUid<S>(spec);
  const detail = SpecSchema.asRawOrDie<D, S>(owner, schema, specWithUid, [ ], [ ]);
  return factory(detail, specWithUid);
};

const composite = function <D extends CompositeSketchDetail, S extends CompositeSketchSpec>(owner: string, schema: Adt[], partTypes: Adt[], factory: CompositeSketchFactory<D, S>, spec: S): SketchSpec {
  const specWithUid = supplyUid<S>(spec);

  // Identify any information required for external parts
  const partSchemas = AlloyParts.schemas(partTypes);

  // Generate partUids for all parts (external and otherwise)
  const partUidsSchema = AlloyParts.defaultUidsSchema(partTypes);

  const detail = SpecSchema.asRawOrDie<D, S>(owner, schema, specWithUid, partSchemas, [ partUidsSchema ]);

  // Create (internals, externals) substitutions
  const subs = AlloyParts.substitutes(owner, detail, partTypes);

  // Work out the components by substituting internals
  const components = AlloyParts.components(owner, detail, subs.internals());

  return factory(detail, components, specWithUid, subs.externals())
};

const supplyUid = function <S>(spec: any): S {
  return spec.hasOwnProperty('uid') ? spec : {
    ...spec,
    uid: Tagger.generate('uid')
  };
};

export {
  supplyUid,
  single,
  composite
};