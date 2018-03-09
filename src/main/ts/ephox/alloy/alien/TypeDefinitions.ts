import { FieldProcessorAdt } from '@ephox/boulder';
import { Option } from '@ephox/katamari';
import { isDisabled } from 'ephox/alloy/behaviour/disabling/DisableApis';
import { value } from '@ephox/boulder/lib/main/ts/ephox/boulder/core/ValueProcessor';

// TODO move these to the correct village

// TODO move this generic into Katamari Adt
// All Alloy and Boulder adts extend this generic interface
export interface AdtInterface {
  fold: <T>(...fn: Array<(...x: any[]) => T>) => T;
  match: <T>(branches: { [k: string]: (...x: any[]) => T }) => T;
  log: (label: string) => string;
}

// Sugar Dom
export interface SugarElement {
  dom: () => HTMLElement;
}

// Sugar Event
export interface SugarEvent {
  kill: () => void;
  prevent: () => void;
  raw: () => any;
  stop: () => void;
  target: () => SugarElement;
  x: () => number;
  y: () => number;
}

// Sugar Position
export interface PositionCoordinates {
  left: () => number;
  top: () => number;
  translate: (x: number, y: number) => PositionCoordinates;
}

// Config

// Behaviours
export interface AlloyBehaviour {
  config: (spec: any) => { key: string, value: any };
  exhibit: (info: any, base: any) => {};
  handlers: (info: any) => {};
  name: () => string;
  revoke: () => { key: string, value: undefined };
  schema: () => FieldProcessorAdt;

  getValue: (any) => any;
  setValue: (...any) => any;
  fields?: FieldProcessorAdt[];
}

// WIP
export interface AlloyBehaviourSchema {
  config: { [key: string]: () => any};
  configAsRaw: () => {
    [key: string]: any;
  };
  initialConfig: {};
  me: AlloyBehaviour;
  state: any;
}

export interface AlloyBehaviourConfig {
  fields: FieldProcessorAdt[];
  name: string;
  active?: {};
  apis?: {};
  extra?: {};
  state?: {};
}
