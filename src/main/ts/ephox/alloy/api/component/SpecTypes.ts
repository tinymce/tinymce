import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { AlloyEventKeyAndHandler, AlloyEventRecord } from '../../api/events/AlloyEvents';
import { ConfiguredPart } from 'ephox/alloy/parts/AlloyParts';
import { Option } from '@ephox/katamari';

export type AlloySpec = SimpleOrSketchSpec | PremadeSpec | ConfiguredPart;

export type SimpleOrSketchSpec = SketchSpec | SimpleSpec;

export interface OptionalDomSchema {
  tag?: string;
  attributes?: Record<string, any>;
  styles?: Record<string, string>;
  innerHtml?: string;
  classes?: string[];
}

export interface StructDomSchema {
  tag: () => string;
  attributes: () => Record<string, any>;
  styles: () => Record<string, string>;
  classes: () => string[];
  value: () => Option<any>;
  innerHtml: () => Option<string>;
}

export interface RawDomSchema extends OptionalDomSchema {
  tag: string;
}

export interface ComponentSpec {
  dom: RawDomSchema;
  components?: AlloySpec[];
  events?: AlloyEventRecord;
  apis?: {};
  behaviours?: AlloyBehaviourRecord;
  domModification?: {};
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