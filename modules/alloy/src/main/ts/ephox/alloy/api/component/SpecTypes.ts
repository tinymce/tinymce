import { Optional } from '@ephox/katamari';

import { DomModification } from '../../dom/DomModification';
import { ConfiguredPart } from '../../parts/AlloyParts';
import { AlloyBehaviourRecord } from '../behaviour/Behaviour';
import { AlloyEventRecord } from '../events/AlloyEvents';
import { AlloyComponent } from './ComponentApi';

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
  value: Optional<string>;
  innerHtml: Optional<string>;
}

export interface RawDomSchema extends OptionalDomSchema {
  tag: string;
}

export interface ComponentDetail {
  uid: string;
  dom: RawDomSchema;
  components: AlloyComponent[];
  events: {
    events: AlloyEventRecord;
  };
  apis?: {};
  behaviours?: AlloyBehaviourRecord;
  domModification?: Partial<DomModification>;
  eventOrder?: Record<string, string[]>;
}

export interface ComponentSpec {
  dom: RawDomSchema;
  components?: AlloySpec[];
  events?: AlloyEventRecord;
  apis?: {};
  behaviours?: AlloyBehaviourRecord;
  domModification?: Partial<DomModification>;
  eventOrder?: Record<string, string[]>;
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
