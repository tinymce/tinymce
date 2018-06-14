import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyBehaviourRecord } from '../../api/behaviour/Behaviour';
import { EventHandlerConfig, EventHandlerConfigRecord } from '../../api/events/AlloyEvents';
import { ConfiguredPart } from 'ephox/alloy/parts/AlloyParts';

export type AlloySpec = SimpleOrSketchSpec | PremadeSpec | ConfiguredPart;

export type SimpleOrSketchSpec = SketchSpec | SimpleSpec;

// This is used or partial specs and things like that.
export type LooseSpec = { };

export interface OptionalDomSchema {
  tag?: string;
  attributes?: Record<string, any>;
  styles?: Record<string, string>;
  innerHtml?: string;
  classes?: string[];
}

export interface RawDomSchema extends OptionalDomSchema {
  tag: string;
}

export interface ComponentSpec {
  dom: RawDomSchema;
  components?: AlloySpec[];
  events?: EventHandlerConfigRecord;
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