import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec, StructDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export type ButtonAction = (AlloyComponent) => void;

export interface TabButtonDetail extends SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  action: () => Option<ButtonAction>;
  tabButtonBehaviours: () => SketchBehaviours;
  domModification: () => any;
  value: () => string;
}

export interface TabButtonSpec extends SingleSketchSpec {
  uid?: string;
  value: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  tabButtonBehaviours?: AlloyBehaviourRecord;
  action?: ButtonAction;
  domModification?: { };
}

export interface TabButtonSketcher extends SingleSketch<TabButtonSpec, TabButtonDetail> { };