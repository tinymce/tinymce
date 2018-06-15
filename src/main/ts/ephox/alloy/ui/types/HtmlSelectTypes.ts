import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { SingleSketch, SingleSketchDetail, SingleSketchSpec } from '../../api/ui/Sketcher';
import { Option } from '@ephox/katamari';

export interface HtmlSelectDetail extends SingleSketchDetail {
  uid: () => string;
  dom: () => RawDomSchema;
  components: () => AlloySpec[ ];
  selectBehaviours: () => SketchBehaviours;
  options: () => [{ value: string; text: string }];
  data: () => Option<string>;
}

export interface HtmlSelectSpec extends SingleSketchSpec {
  uid?: string;
  dom: Partial<RawDomSchema>;
  components?: AlloySpec[];
  options: Array<{ value: string, text: string }>;
  selectBehaviours?: AlloyBehaviourRecord;
  data?: string;
}

export interface HtmlSelectSketcher extends SingleSketch<HtmlSelectSpec, HtmlSelectDetail> { }