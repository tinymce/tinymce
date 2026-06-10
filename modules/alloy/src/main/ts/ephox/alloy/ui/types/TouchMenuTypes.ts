import type { Future, Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { LazySink } from '../../api/component/CommonTypes';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema, SimpleOrSketchSpec } from '../../api/component/SpecTypes';
import type { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';
import type { TransitionProperties } from '../../behaviour/transitioning/TransitioningTypes';
import type { AnchorSpec } from '../../positioning/mode/Anchoring';

import type { CommonDropdownDetail } from './DropdownTypes';
import type { ItemDataTuple, ItemSpec } from './ItemTypes';
import type { TabviewSpec } from './TabviewTypes';
import type { PartialMenuSpec } from './TieredMenuTypes';

export interface TouchMenuDetail extends CommonDropdownDetail<ItemSpec[]>, CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  touchmenuBehaviours: SketchBehaviours;

  onHoverOn: (comp: AlloyComponent) => void;
  onHoverOff: (comp: AlloyComponent) => void;
  toggleClass: string;

  onExecute: (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: ItemDataTuple) => void;
  onTap: (comp: AlloyComponent) => void;

  menuTransition: TransitionProperties['transition'];

  onOpen: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;
  onClosed: (sandbox: AlloyComponent, inline: AlloyComponent) => void;
  eventOrder: Record<string, string[]>;
  role: Optional<string>;

  getAnchor: (comp: AlloyComponent) => AnchorSpec;
  lazySink: Optional<LazySink>;

  fetch: (comp: AlloyComponent) => Future<Optional<ItemSpec[]>>;
}

export interface TouchMenuSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  touchmenuBehaviours?: AlloyBehaviourRecord;
  sandboxClasses?: string[];
  sandboxBehaviours?: AlloyBehaviourRecord;

  onHoverOn?: (comp: AlloyComponent) => void;
  onHoverOff?: (comp: AlloyComponent) => void;
  toggleClass: string;

  onExecute?: (sandbox: AlloyComponent, menu: AlloyComponent, item: AlloyComponent, value: ItemDataTuple) => void;
  onTap?: (comp: AlloyComponent) => void;

  menuTransition?: { property: string; transitionClass: string };

  onOpen?: (anchor: AnchorSpec, comp: AlloyComponent, menu: AlloyComponent) => void;
  onClosed?: (sandbox: AlloyComponent, inline: AlloyComponent) => void;
  eventOrder?: Record<string, string[]>;
  role?: string;

  lazySink?: LazySink;

  fetch: (comp: AlloyComponent) => Future<Optional<ItemSpec[]>>;
  matchWidth?: boolean;
  useMinWidth?: boolean;

  parts: {
    menu: PartialMenuSpec;
    view: Partial<TabviewSpec>;
    sink?: SimpleOrSketchSpec;
  };

  getAnchor?: (comp: AlloyComponent) => AnchorSpec;
}

export interface TouchMenuSketcher extends CompositeSketch<TouchMenuSpec> { }
