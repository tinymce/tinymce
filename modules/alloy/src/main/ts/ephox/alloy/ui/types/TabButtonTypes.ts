import type { Optional } from '@ephox/katamari';

import type { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import type { AlloyComponent } from '../../api/component/ComponentApi';
import type { SketchBehaviours } from '../../api/component/SketchBehaviours';
import type { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import type { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import type { DomModification, DomModificationSpec } from '../../dom/DomModification';

export type ButtonAction = (comp: AlloyComponent) => void;

export interface TabButtonDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  action: Optional<ButtonAction>;
  tabButtonBehaviours: SketchBehaviours;
  domModification: DomModification;
  value: string;
}

export interface TabButtonSpec extends SingleSketchSpec {
  uid?: string;
  value: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabButtonBehaviours?: AlloyBehaviourRecord;
  action?: ButtonAction;
  domModification?: DomModificationSpec;
}

export interface TabButtonSketcher extends SingleSketch<TabButtonSpec> { }
