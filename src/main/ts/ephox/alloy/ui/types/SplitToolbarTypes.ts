import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ToolbarGroupSpec } from '../types/ToolbarGroupTypes';
import { ToolbarSpec } from '../types/ToolbarTypes';
import { LazySink } from '../../api/component/CommonTypes';
import { AnchorSpec } from '../../positioning/mode/Anchoring';

export interface SplitToolbarDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  lazySink: LazySink;
  splitToolbarBehaviours: SketchBehaviours;
  floating: boolean;
  floatingAnchor: (toolbar: AlloyComponent) => Option<AnchorSpec>;

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
  lazySink: LazySink;
  splitToolbarBehaviours?: AlloyBehaviourRecord;
  floating?: boolean;
  floatingAnchor?: (toolbar: AlloyComponent) => Option<AnchorSpec>;

  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    overflowToggledClass: string;
  };

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>,
    'overflow': Partial<ToolbarSpec>
  };
}

export interface SplitToolbarSketcher extends CompositeSketch<SplitToolbarSpec, SplitToolbarDetail> {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
  toggle: (toolbar: AlloyComponent) => void;
  getMoreButton: (toolbar: AlloyComponent) => Option<AlloyComponent>;
  getOverflow: (toolbar: AlloyComponent) => Option<AlloyComponent>;
}