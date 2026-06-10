import { Obj, type Optional } from '@ephox/katamari';

import * as Tagger from '../../registry/Tagger';
import { isSketchSpec } from '../ui/Sketcher';

import type { AlloyComponent } from './ComponentApi';
import type { SimpleOrSketchSpec } from './SpecTypes';

export interface MementoRecord {
  get: (comp: AlloyComponent) => AlloyComponent;
  getOpt: (comp: AlloyComponent) => Optional<AlloyComponent>;
  asSpec: () => SimpleOrSketchSpec;
}

const record = (spec: SimpleOrSketchSpec): MementoRecord => {
  const uid = isSketchSpec(spec) && Obj.hasNonNullableKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

  const get = (anyInSystem: AlloyComponent): AlloyComponent => anyInSystem.getSystem().getByUid(uid).getOrDie();

  const getOpt = (anyInSystem: AlloyComponent): Optional<AlloyComponent> => anyInSystem.getSystem().getByUid(uid).toOptional();

  const asSpec = (): SimpleOrSketchSpec => ({
    ...spec,
    uid
  });

  return {
    get,
    getOpt,
    asSpec
  };
};

export {
  record
};
