import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface ExpandableFormDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  expandableBehaviours: SketchBehaviours;
  action: Optional<ExpandableFormAction>;
  role: Optional<string>;
  eventOrder: Record<string, string[]>;

  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    expandedClass: string;
    collapsedClass: string;
  };

  onShrunk: (extra: AlloyComponent) => void;
  onGrown: (extra: AlloyComponent) => void;
}

export type ExpandableFormAction = (comp: AlloyComponent) => void;

export interface ExpandableFormSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  expandableBehaviours?: AlloyBehaviourRecord;
  eventOrder?: Record<string, string[]>;

  markers: {
    closedClass: string;
    openClass: string;
    shrinkingClass: string;
    growingClass: string;
    expandedClass: string;
    collapsedClass: string;
  };

  onShrunk?: (extra: AlloyComponent) => void;
  onGrown?: (extra: AlloyComponent) => void;
}

export interface ExpandableFormApis {
  toggleForm: (component: AlloyComponent) => void;
  getField: (component: AlloyComponent, key: string) => Optional<AlloyComponent>;
  collapseForm: (component: AlloyComponent) => void;
  collapseFormImmediately: (component: AlloyComponent) => void;
  expandForm: (component: AlloyComponent) => void;
}

export interface ExpandableFormSketcher extends CompositeSketch<ExpandableFormSpec>, ExpandableFormApis { }
