import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { DomModification, DomModificationSpec } from '../../dom/DomModification';

export type ButtonAction = (comp: AlloyComponent) => void;

export interface TabButtonDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  action: Option<ButtonAction>;
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
