import { Option, Result } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { AnchorSpec } from '../../positioning/mode/Anchoring';
import { TieredData } from './TieredMenuTypes';

export interface InlineViewDetail extends SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  inlineBehaviours: () => SketchBehaviours;
  onShow: () => (component: AlloyComponent) => void;
  onHide: () => (component: AlloyComponent) => void;
  getRelated: () => (component: AlloyComponent) => Option<AlloyComponent>;
  lazySink: () =>  () => Result<AlloyComponent, Error>;
  eventOrder: () => Record<string, string[]>;
  fireDismissalEventInstead: () => Option<{
    event: () => string
  }>;
}

export interface InlineViewSpec extends SingleSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  inlineBehaviours?: AlloyBehaviourRecord;
  lazySink: () => Result<AlloyComponent, Error>;
  onShow?: (component: AlloyComponent) => void;
  onHide?: (component: AlloyComponent) => void;
  getRelated?: (component: AlloyComponent) => Option<AlloyComponent>;
  eventOrder?: Record<string, string[]>;
  fireDismissalEventInstead?: {
    event?: string
  };
}

export interface InlineViewSketcher extends SingleSketch<InlineViewSpec, InlineViewDetail> {
  showAt: (component: AlloyComponent, anchor: AnchorSpec, thing: AlloySpec) => void;
  showMenu: (component: AlloyComponent, anchor: AnchorSpec, menuSpec) => void;
  hide: (component: AlloyComponent) => void;
  isOpen: (component: AlloyComponent) => boolean;
  getContent: (component: AlloyComponent) => Option<AlloyComponent>;
}
