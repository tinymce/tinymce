import { Cell, Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import { ToolbarGroupSpec } from './ToolbarGroupTypes';

export interface SplitToolbarBaseDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  splitToolbarBehaviours: SketchBehaviours;

  builtGroups: Cell<AlloyComponent[]>;
}

export interface SplitToolbarBaseSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitToolbarBehaviours?: AlloyBehaviourRecord;

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>,
    'overflow-button': Partial<SimpleOrSketchSpec>
  };
}

export interface SplitToolbarBaseSketcher<T extends SplitToolbarBaseSpec, U extends SplitToolbarBaseDetail> extends CompositeSketch<T, U> {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
  toggle: (toolbar: AlloyComponent) => void;
  getMoreButton: (toolbar: AlloyComponent) => Option<AlloyComponent>;
  getOverflow: (toolbar: AlloyComponent) => Option<AlloyComponent>;
}
