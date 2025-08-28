import type { Optional } from '@ephox/katamari';
import type { SugarElement } from '@ephox/sugar';

import type { Bounds } from '../../alien/Boxes';
import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { LazySink } from '../../api/component/CommonTypes';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import type { PlacementSpec } from '../../behaviour/positioning/PositioningTypes';

import type { TieredData, TieredMenuSpec } from './TieredMenuTypes';

export interface InlineViewDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  inlineBehaviours: SketchBehaviours;
  onShow: (component: AlloyComponent) => void;
  onHide: (component: AlloyComponent) => void;
  onEscape: Optional<(component: AlloyComponent) => void>;
  getRelated: (component: AlloyComponent) => Optional<AlloyComponent>;
  isExtraPart: (component: AlloyComponent, target: SugarElement<Node>) => boolean;
  lazySink: LazySink;
  eventOrder: Record<string, string[]>;
  fireDismissalEventInstead: Optional<{
    event: string;
  }>;
  fireRepositionEventInstead: Optional<{
    event: string;
  }>;
}

export interface InlineViewSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  inlineBehaviours?: AlloyBehaviourRecord;
  lazySink: LazySink;
  onShow?: (component: AlloyComponent) => void;
  onHide?: (component: AlloyComponent) => void;
  onEscape?: (component: AlloyComponent) => void;
  getRelated?: (component: AlloyComponent) => Optional<AlloyComponent>;
  isExtraPart?: (component: AlloyComponent, target: SugarElement<Node>) => boolean;
  eventOrder?: Record<string, string[]>;
  fireDismissalEventInstead?: {
    event?: string;
  };
  fireRepositionEventInstead?: {
    event?: string;
  };
}

export interface InlineMenuSpec {
  data: TieredData;
  menu: Partial<TieredMenuSpec> & { markers: TieredMenuSpec['markers'] };
  type?: 'vertical' | 'horizontal';
}

export interface InlineViewApis {
  showAt: (component: AlloyComponent, thing: AlloySpec, placementSpec: PlacementSpec) => void;
  showWithinBounds: (component: AlloyComponent, thing: AlloySpec, placementSpec: PlacementSpec, getBounds: () => Optional<Bounds>) => void;
  showMenuAt: (component: AlloyComponent, placementSpec: PlacementSpec, menuSpec: InlineMenuSpec) => void;
  showMenuWithinBounds: (component: AlloyComponent, placementSpec: PlacementSpec, menuSpec: InlineMenuSpec, getBounds: () => Optional<Bounds>) => void;
  hide: (component: AlloyComponent) => void;
  isOpen: (component: AlloyComponent) => boolean;
  getContent: (component: AlloyComponent) => Optional<AlloyComponent>;
  setContent: (component: AlloyComponent, thing: AlloySpec) => void;
  reposition: (component: AlloyComponent) => void;
}

export interface InlineViewSketcher extends SingleSketch<InlineViewSpec>, InlineViewApis { }
