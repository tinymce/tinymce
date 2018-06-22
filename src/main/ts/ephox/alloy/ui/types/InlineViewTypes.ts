import { Option, Result } from '@ephox/katamari';

import { Element } from '@ephox/sugar';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export interface InlineViewDetail extends SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  inlineBehaviours: () => SketchBehaviours;
  onShow: () => (component: AlloyComponent) => void;
  onHide: () => (component: AlloyComponent) => void;
  getRelated: () => (component: AlloyComponent) => Option<AlloyComponent>;
  lazySink: () =>  () => Result<AlloyComponent, Error>;
  eventOrder: () => Record<string, string[]>
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
  eventOrder?: Record<string, string[]>
}

// TYPIFY
export interface InlineViewAnchor {
  anchor: string;
  x?: number;
  y?: number;
  item?: AlloyComponent;
  root?: Element;
}

export interface InlineViewSketcher extends SingleSketch<InlineViewSpec, InlineViewDetail> {
  showAt: (component: AlloyComponent, anchor: InlineViewAnchor, thing: SketchSpec) => void;
  hide: (component: AlloyComponent) => void;
  isOpen: (component: AlloyComponent) => boolean;
}
