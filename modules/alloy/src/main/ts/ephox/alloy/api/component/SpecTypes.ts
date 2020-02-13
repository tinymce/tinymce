import { Option } from '@ephox/katamari';

import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloyEventRecord } from '../../api/events/AlloyEvents';
import { DomModification } from '../../dom/DomModification';
import { ConfiguredPart } from '../../parts/AlloyParts';

export type AlloySpec = SimpleOrSketchSpec | PremadeSpec | ConfiguredPart;

export type SimpleOrSketchSpec = SketchSpec | SimpleSpec;

export interface OptionalDomSchema {
  tag?: string;
  attributes?: Record<string, string | boolean | number>;
  styles?: Record<string, string>;
  innerHtml?: string;
  classes?: string[];
}

export interface StructDomSchema {
  tag: string;
  attributes: Record<string, string | boolean | number>;
  styles: Record<string, string>;
  classes: string[];
  value: Option<string>;
  innerHtml: Option<string>;
}

export interface RawDomSchema extends OptionalDomSchema {
  tag: string;
}

export interface ComponentDetail {
  dom: RawDomSchema;
  components: AlloyComponent[];
  events: {
    events: AlloyEventRecord
  };
  apis?: {};
  behaviours?: AlloyBehaviourRecord;
  domModification?: Partial<DomModification>;
  eventOrder?: {};
}

export interface ComponentSpec {
  dom: RawDomSchema;
  components?: AlloySpec[];
  events?: AlloyEventRecord;
  apis?: {};
  behaviours?: AlloyBehaviourRecord;
  domModification?: Partial<DomModification>;
  eventOrder?: {};
}

export interface SketchSpec extends ComponentSpec {
  uid: string;
}

export interface SimpleSpec extends ComponentSpec {
  uid?: string;
}

export interface PremadeSpec {
  [key: string]: AlloyComponent;
}
