import { Option, Future } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface TouchMenuDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  components: () => AlloySpec[ ];
  touchmenuBehaviours: () => SketchBehaviours;

  onHoverOn: () => (comp: AlloyComponent) => void;
  onHoverOff: () => (comp: AlloyComponent) => void;
  toggleClass: () => string;

  onExecute: () => (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: string) => void;
  onTap: () => (comp: AlloyComponent) => void;

  menuTransition: () => Option<{ property: string; transitionClass: string }>;

  onClosed: () => (sandbox: AlloyComponent, inline: AlloyComponent) => void;
  eventOrder: () => Record<string, string[]>;
  role: () => Option<string>;

  // FIX: TYPIFY
  getAnchor: () => (comp: AlloyComponent) => any;

  // FIX: TYPIFY
  fetch: () => (comp: AlloyComponent) => Future<{ items: Array<any> }>;
}

export interface TouchMenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  touchmenuBehaviours?: AlloyBehaviourRecord;

  toggleClass: string;
  onHoverOn?: (comp: AlloyComponent) => void;
  onHoverOff?: (comp: AlloyComponent) => void;

  onExecute: (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: string) => void;
}

export interface TouchMenuSketcher extends CompositeSketch<TouchMenuSpec, TouchMenuDetail> { }
