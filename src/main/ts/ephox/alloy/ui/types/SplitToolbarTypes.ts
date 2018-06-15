import { Option, Cell } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, LooseSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';
import { ToolbarGroupSpec } from '../../ui/types/ToolbarGroupTypes';

export interface SplitToolbarDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  splitToolbarBehaviours: () => SketchBehaviours;

  builtGroups: () => Cell<AlloyComponent[]>;
  markers: () => {
    closedClass: () => string;
    openClass: () => string;
    shrinkingClass: () => string;
    growingClass: () => string;
  }
}

export interface SplitToolbarSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitToolbarBehaviours?: AlloyBehaviourRecord;

  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': LooseSpec;
  }
}

export interface SplitToolbarSketcher extends CompositeSketch<SplitToolbarSpec, SplitToolbarDetail> {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
}