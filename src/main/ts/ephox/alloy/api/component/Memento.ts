import { Objects } from '@ephox/boulder';
import { Merger, Option } from '@ephox/katamari';
import { SimpleOrSketchSpec } from '../../api/component/SpecTypes';

import { isSketchSpec } from '../../api/ui/Sketcher';
import * as Tagger from '../../registry/Tagger';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface MomentoRecord {
  get: (AlloyComponent) => AlloyComponent;
  getOpt: (AlloyComponent) => Option<AlloyComponent>;
  asSpec: () => SimpleOrSketchSpec;
}

const record = function (spec: SimpleOrSketchSpec) {
  const uid = isSketchSpec(spec) && Objects.hasKey(spec, 'uid') ? spec.uid : Tagger.generate('memento');

  const get = function (anyInSystem: AlloyComponent): AlloyComponent {
    return anyInSystem.getSystem().getByUid(uid).getOrDie();
  };

  const getOpt = function (anyInSystem: AlloyComponent): Option<AlloyComponent> {
    return anyInSystem.getSystem().getByUid(uid).fold(Option.none, Option.some);
  };

  const asSpec = function (): SimpleOrSketchSpec {
    return Merger.deepMerge(spec, {
      uid
    });
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