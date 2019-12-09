import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface ExpandableFormDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  expandableBehaviours: SketchBehaviours;
  action: Option<ExpandableFormAction>;
  role: Option<string>;
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
  getField: (component: AlloyComponent, key: string) => Option<AlloyComponent>;
  collapseForm: (component: AlloyComponent) => void;
  collapseFormImmediately: (component: AlloyComponent) => void;
  expandForm: (component: AlloyComponent) => void;
}

export interface ExpandableFormSketcher extends CompositeSketch<ExpandableFormSpec>, ExpandableFormApis { }
