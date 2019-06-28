import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { Bounds } from '../../alien/Boxes';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { LazySink } from '../../api/component/CommonTypes';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { TieredData, TieredMenuSpec } from './TieredMenuTypes';

export interface InlineViewDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  inlineBehaviours: SketchBehaviours;
  onShow: (component: AlloyComponent) => void;
  onHide: (component: AlloyComponent) => void;
  onEscape: Option<(component: AlloyComponent) => void>;
  getRelated: (component: AlloyComponent) => Option<AlloyComponent>;
  lazySink: LazySink;
  eventOrder: Record<string, string[]>;
  fireDismissalEventInstead: Option<{
    event: string
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
  getRelated?: (component: AlloyComponent) => Option<AlloyComponent>;
  eventOrder?: Record<string, string[]>;
  fireDismissalEventInstead?: {
    event?: string
  };
}

export interface InlineMenuSpec {
  data: TieredData;
  menu: Partial<TieredMenuSpec>;
}

export interface InlineViewSketcher extends SingleSketch<InlineViewSpec, InlineViewDetail> {
  showAt: (component: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) => void;
  showWithin: (component: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, boxElement: Option<Element>) => void;
  showWithinBounds: (component: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec, bounds: Option<Bounds>) => void;
  showMenuAt: (component: AlloyComponent, anchor: AnchorSpec, menuSpec: InlineMenuSpec) => void;
  hide: (component: AlloyComponent) => void;
  isOpen: (component: AlloyComponent) => boolean;
  getContent: (component: AlloyComponent) => Option<AlloyComponent>;
  setContent: (component: AlloyComponent, thing: AlloySpec) => void;
}
