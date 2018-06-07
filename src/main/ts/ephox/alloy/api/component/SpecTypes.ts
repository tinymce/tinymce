import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyBehaviourRecord } from 'ephox/alloy/api/behaviour/Behaviour';
import { EventHandlerConfig, EventHandlerConfigRecord } from 'ephox/alloy/api/events/AlloyEvents';

export type AlloySpec = SimpleOrSketchSpec | PremadeSpec;

export type SimpleOrSketchSpec = SketchSpec | SimpleSpec;

// This is used or partial specs and things like that.
export type LooseSpec = { };

export interface RawDomSchema {
  tag: string;
  attributes?: Record<string, any>;
  styles?: Record<string, string>;
  innerHtml?: string;
  classes?: string[];
}

export interface ComponentSpec {
  dom: RawDomSchema;
  components?: ComponentSpec[];
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