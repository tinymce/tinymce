import type { Cell } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema, SimpleOrSketchSpec, SketchSpec } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

import type { ToolbarGroupSpec } from './ToolbarGroupTypes';

export interface SplitToolbarBaseDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  splitToolbarBehaviours: SketchBehaviours;
  builtGroups: Cell<AlloyComponent[]>;
}

export interface SplitToolbarBaseApis {
  setGroups: (toolbar: AlloyComponent, groups: SketchSpec[]) => void;
  refresh: (toolbar: AlloyComponent) => void;
  toggle: (toolbar: AlloyComponent) => void;
  toggleWithoutFocusing: (toolbar: AlloyComponent) => void;
  isOpen: (toolbar: AlloyComponent) => boolean;
}

export interface SplitToolbarBaseSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  splitToolbarBehaviours?: AlloyBehaviourRecord;

  parts: {
    'overflow-group': Partial<ToolbarGroupSpec>;
    'overflow-button': Partial<SimpleOrSketchSpec>;
  };
}

export interface SplitToolbarBaseSketcher<T extends SplitToolbarBaseSpec>
  extends CompositeSketch<T>, SplitToolbarBaseApis { }
