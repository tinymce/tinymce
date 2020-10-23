import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema } from '../../api/component/SpecTypes';
import { CompositeSketch, CompositeSketchDetail, CompositeSketchSpec } from '../../api/ui/Sketcher';

export interface FormChooserDetail extends CompositeSketchDetail {
  uid: string;
  dom: RawDomSchema;
  chooserBehaviours: SketchBehaviours;
  markers: {
    choiceClass: string;
    selectedClass: string;
  };
}

export interface FormChooserSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  chooserBehaviours?: AlloyBehaviourRecord;
  markers: {
    choiceClass: string;
    selectedClass: string;
  };

  choices: Array<{ value: string }>;
}

export interface FormChooserSketcher extends CompositeSketch<FormChooserSpec> { }
