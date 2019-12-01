import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';

export interface HtmlSelectDetail extends SingleSketchDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloySpec[ ];
  selectBehaviours: SketchBehaviours;
  selectAttributes: Record<string, any>;
  selectClasses: string[];
  options: [{ value: string; text: string }];
  data: Option<string>;
}

export interface HtmlSelectSpec extends SingleSketchSpec {
  uid?: string;
  dom: Partial<RawDomSchema>;
  components?: AlloySpec[];
  options: Array<{ value: string, text: string }>;
  selectBehaviours?: AlloyBehaviourRecord;
  selectAttributes?: Record<string, any>;
  selectClasses?: string[];
  data?: string;
}

export interface HtmlSelectSketcher extends SingleSketch<HtmlSelectSpec> { }
