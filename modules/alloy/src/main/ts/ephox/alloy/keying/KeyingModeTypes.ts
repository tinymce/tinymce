import { Optional } from '@ephox/katamari';
import { EventArgs, SugarElement } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import * as AlloyEvents from '../api/events/AlloyEvents';
import { FocusManager } from '../api/focus/FocusManagers';
import { BehaviourState, Stateless } from '../behaviour/common/BehaviourState';
import { NativeSimulatedEvent, SimulatedEvent } from '../events/SimulatedEvent';

export type KeyHandlerApi = (comp: AlloyComponent, se: NativeSimulatedEvent<KeyboardEvent>) => Optional<boolean>;

export type KeyRuleHandler<C, S> = (comp: AlloyComponent, se: NativeSimulatedEvent<KeyboardEvent>, config: C, state: S) => Optional<boolean>;
export type KeyRuleStatelessHandler<C> = (comp: AlloyComponent, se: NativeSimulatedEvent<KeyboardEvent>, config: C) => Optional<boolean>;

export enum FocusInsideModes {
  OnFocusMode = 'onFocus',
  OnEnterOrSpaceMode = 'onEnterOrSpace',
  OnApiMode = 'onApi'
}

export interface GeneralKeyingConfigSpec {
  focusManager?: FocusManager;
  focusInside?: FocusInsideModes;
}

export interface GeneralKeyingConfig {
  focusManager: FocusManager;
  sendFocusIn: <C extends GeneralKeyingConfig, S>(conf: C) => Optional<(comp: AlloyComponent, config: C, state: S, evt?: SimulatedEvent<EventArgs>) => void>;
  focusInside: FocusInsideModes;
  handler: {
    toEvents: <C extends GeneralKeyingConfig, S>(keyingConfig: C, keyingState: S) => AlloyEvents.AlloyEventRecord;
  };
  state: <C extends GeneralKeyingConfig>(spec: C) => Stateless | FlatgridState;
}

export interface TabbingConfigSpec extends GeneralKeyingConfigSpec {
  onEscape?: KeyHandlerApi;
  onEnter?: KeyHandlerApi;
  selector?: string;
  firstTabstop?: number;
  useTabstopAt?: (elem: SugarElement<HTMLElement>) => boolean;
  visibilitySelector?: string;
}

export interface TabbingConfig extends GeneralKeyingConfig {
  onEscape: Optional<KeyHandlerApi>;
  onEnter: Optional<KeyHandlerApi>;
  selector: string;
  firstTabstop: number;
  useTabstopAt: (elem: SugarElement<HTMLElement>) => boolean;
  visibilitySelector: Optional<string>;
  cyclic: boolean;
}

export interface AcylicConfigSpec extends TabbingConfigSpec {
  mode: 'acyclic';
}

export interface CyclicConfigSpec extends TabbingConfigSpec {
  mode: 'cyclic';
}

export interface AcyclicConfig extends TabbingConfig {
  cyclic: false;
}

export interface CyclicConfig extends TabbingConfig {
  cyclic: true;
}

// Escaping Type
export interface EscapingConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'escaping';
  onEscape: KeyHandlerApi;
}

export interface EscapingConfig extends GeneralKeyingConfig {
  onEscape: KeyHandlerApi;
}

// Execution Type
export interface ExecutingConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'execution';
  // NOTE: inconsistent.
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  useSpace?: boolean;
  useEnter?: boolean;
  useControlEnter?: boolean;
  useDown?: boolean;
}

export interface ExecutingConfig extends GeneralKeyingConfig {
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  useSpace: boolean;
  useEnter: boolean;
  useControlEnter: boolean;
  useDown: boolean;
}

// Flatgrid type
export interface FlatgridConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flatgrid';
  selector: string;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  onEscape?: KeyHandlerApi;
  captureTab?: boolean;
  initSize: {
    numColumns: number;
    numRows: number;
  };
}

export interface FlatgridConfig extends GeneralKeyingConfig {
  selector: string;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  onEscape: KeyHandlerApi;
  captureTab: boolean;
  initSize: {
    numColumns: number;
    numRows: number;
  };
}

export interface FlatgridState extends BehaviourState {
  getNumRows: () => Optional<number>;
  getNumColumns: () => Optional<number>;
  setGridSize: (numRows: number, numColumns: number) => void;
}

// Flow type
export interface FlowConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flow';
  selector: string;
  getInitial?: (comp: AlloyComponent) => Optional<SugarElement<HTMLElement>>;
  onEscape?: KeyHandlerApi;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  executeOnMove?: boolean;
  allowVertical?: boolean;
  allowHorizontal?: boolean;
  cycles?: boolean;
}

export interface FlowConfig extends GeneralKeyingConfig {
  selector: string;
  getInitial: (comp: AlloyComponent) => Optional<SugarElement<HTMLElement>>;
  onEscape: KeyHandlerApi;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  executeOnMove: boolean;
  allowVertical: boolean;
  allowHorizontal: boolean;
  cycles: boolean;
}

// Matrix type
export interface MatrixConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'matrix';
  selectors: {
    row: string;
    cell: string;
  };
  cycles?: boolean;
  previousSelector?: (comp: AlloyComponent) => Optional<SugarElement<HTMLElement>>;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
}

export interface MatrixConfig extends GeneralKeyingConfig {
  selectors: {
    row: string;
    cell: string;
  };
  cycles: boolean;
  previousSelector: (comp: AlloyComponent) => Optional<SugarElement<HTMLElement>>;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
}

// Menu type
export interface MenuConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'menu';
  selector: string;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  moveOnTab?: boolean;
}

export interface MenuConfig extends GeneralKeyingConfig {
  selector: string;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement<HTMLElement>) => Optional<boolean>;
  moveOnTab: boolean;
}

export interface SpecialConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'special';
  onSpace?: KeyHandlerApi;
  onEnter?: KeyHandlerApi;
  onShiftEnter?: KeyHandlerApi;
  onLeft?: KeyHandlerApi;
  onRight?: KeyHandlerApi;
  onTab?: KeyHandlerApi;
  onShiftTab?: KeyHandlerApi;
  onUp?: KeyHandlerApi;
  onDown?: KeyHandlerApi;
  onEscape?: KeyHandlerApi;
  stopSpaceKeyup?: boolean;
  focusIn?: (comp: AlloyComponent, info: SpecialConfig, state: Stateless) => void;
}

export interface SpecialConfig extends GeneralKeyingConfig {
  onSpace: KeyHandlerApi;
  onEnter: KeyHandlerApi;
  onShiftEnter: KeyHandlerApi;
  onLeft: KeyHandlerApi;
  onRight: KeyHandlerApi;
  onTab: KeyHandlerApi;
  onShiftTab: KeyHandlerApi;
  onUp: KeyHandlerApi;
  onDown: KeyHandlerApi;
  onEscape: KeyHandlerApi;
  stopSpaceKeyup: boolean;
  focusIn: Optional<(comp: AlloyComponent, info: SpecialConfig, state: Stateless) => void>;
}
