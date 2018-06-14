
import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import { AlloySpec, RawDomSchema, SketchSpec } from '../../api/component/SpecTypes';
import { SingleSketch, CompositeSketchSpec, CompositeSketch, CompositeSketchDetail } from '../../api/ui/Sketcher';

export interface FormChooserDetail extends CompositeSketchDetail {
  uid: () => string;
  // FIX: Completed DOM tpye.
  dom: () => any;
  chooserBehaviours: () => SketchBehaviours;
  markers: () => {
    choiceClass: () => string;
    selectedClass: () => string;
  }
}

export interface FormChooserSpec extends CompositeSketchSpec {
  uid?: string;
  dom: RawDomSchema;
  components?: AlloySpec[];
  chooserBehaviours?: AlloyBehaviourRecord;
  markers: {
    choiceClass: string;
    selectedClass: string;
  }
}

export interface FormChooserSketcher extends CompositeSketch<FormChooserSpec, FormChooserDetail> { }