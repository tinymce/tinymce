import { Future, Option, Result } from '@ephox/katamari';
import { TabviewSpec } from 'ephox/alloy/ui/types/TabviewTypes';
import { PartialMenuSpec } from 'ephox/alloy/ui/types/TieredMenuTypes';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, LooseSpec, RawDomSchema, StructDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface TouchMenuDetail extends CompositeSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  touchmenuBehaviours: () => SketchBehaviours;

  onHoverOn: () => (comp: AlloyComponent) => void;
  onHoverOff: () => (comp: AlloyComponent) => void;
  toggleClass: () => string;

  onExecute: () => (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: { value: string, text: string }) => void;
  onTap: () => (comp: AlloyComponent) => void;

  menuTransition: () => Option<{ property: string; transitionClass: string }>;

  onClosed: () => (sandbox: AlloyComponent, inline: AlloyComponent) => void;
  eventOrder: () => Record<string, string[]>;
  role: () => Option<string>;

  // FIX: TYPIFY
  getAnchor: () => (comp: AlloyComponent) => any;
  lazySink?: () => Option<() => Result<AlloyComponent, Error>>;

  // FIX: TYPIFY
  fetch: () => (comp: AlloyComponent) => Future<Array<LooseSpec>>;
}

export interface TouchMenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  touchmenuBehaviours?: AlloyBehaviourRecord;

  onHoverOn?: (comp: AlloyComponent) => void;
  onHoverOff?: (comp: AlloyComponent) => void;
  toggleClass: string;

  onExecute?: (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: { value: string, text: string }) => void;
  onTap?: (comp: AlloyComponent) => void;

  menuTransition?: { property: string, transitionClass: string };

  onClosed?: (sandbox: AlloyComponent, inline: AlloyComponent) => void;
  eventOrder?: Record<string, string[]>;
  role?: string;

  lazySink?: () => Result<AlloyComponent, Error>;

  // FIX: TYPIFY
  fetch: (comp: AlloyComponent) => Future<Array<LooseSpec>>;

  parts: {
    menu: PartialMenuSpec,
    view: Partial<TabviewSpec>,
    sink?: LooseSpec
  },

  getAnchor?: (comp: AlloyComponent) => any;
}

export interface TouchMenuSketcher extends CompositeSketch<TouchMenuSpec, TouchMenuDetail> { }
