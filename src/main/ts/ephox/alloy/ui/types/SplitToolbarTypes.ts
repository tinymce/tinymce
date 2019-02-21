import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ToolbarGroupSpec } from '../../ui/types/ToolbarGroupTypes';
import { Element } from '@ephox/sugar';

export interface SplitToolbarDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  splitToolbarBehaviours: SketchBehaviours;
  floating: boolean;
  overflow: (toolbar: AlloyComponent) => Option<AlloyComponent>;

  builtGroups: Cell<AlloyComponent[]>;
  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    overflowToggledClass: string;
  };
}

export interface SplitToolbarSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitToolbarBehaviours?: AlloyBehaviourRecord;
  floating?: boolean;
  overflow?: (toolbar: AlloyComponent) => Option<AlloyComponent>;

  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    overflowToggledClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>
  };
}

export interface SplitToolbarSketcher extends CompositeSketch<SplitToolbarSpec, SplitToolbarDetail> {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
  getMoreButton: (toolbar: AlloyComponent) => Option<AlloyComponent>;
}