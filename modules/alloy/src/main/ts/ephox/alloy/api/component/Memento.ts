import { Objects } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';

import { isSketchSpec } from '../../api/ui/Sketcher';
import * as Tagger from '../../registry/Tagger';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface MementoRecord {
  get: (comp: AlloyComponent) => AlloyComponent;
  getOpt: (comp: AlloyComponent) => Option<AlloyComponent>;
  asSpec: () => SimpleOrSketchSpec;
}

const record = (spec: SimpleOrSketchSpec): MementoRecord => {
  const uid = isSketchSpec(spec) && Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

  const get = (anyInSystem: AlloyComponent): AlloyComponent => {
    return anyInSystem.getSystem().getByUid(uid).getOrDie();
  };

  const getOpt = (anyInSystem: AlloyComponent): Option<AlloyComponent> => {
    return anyInSystem.getSystem().getByUid(uid).toOption();
  };

  const asSpec = (): SimpleOrSketchSpec => {
    return {
      ...spec,
      uid
    };
  };

  return {
    get,
    getOpt,
    asSpec
  };
};

export {
  record
};
