import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { AlloyComponent } from '../api/component/ComponentApi';
import { FocusManager } from '../api/focus/FocusManagers';
import { BehaviourState, Stateless } from '../behaviour/common/BehaviourState';
import { NativeSimulatedEvent, SimulatedEvent } from '../events/SimulatedEvent';

// TODO: Fix this.
export type KeyHandlerApi<C, S> = (comp: AlloyComponent, se: NativeSimulatedEvent, config?: C, state?: S) => Option<boolean>;

export type KeyRuleHandler<C, S> = (comp: AlloyComponent, se: NativeSimulatedEvent, config: C, state?: S) => Option<boolean>;

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
  sendFocusIn: <C extends GeneralKeyingConfig, S>(conf: C) => Option<(comp: AlloyComponent, config: C, state: S, evt?: SimulatedEvent<any>) => void>;
  focusInside: FocusInsideModes;
}

export interface TabbingConfigSpec<C extends TabbingConfig> extends GeneralKeyingConfigSpec {
  onEscape?: KeyHandlerApi<C, Stateless>;
  onEnter?: KeyHandlerApi<C, Stateless>;
  selector?: string;
  firstTabstop?: number;
  useTabstopAt?: (elem: Element) => boolean;
  visibilitySelector?: string;
}

export interface TabbingConfig extends GeneralKeyingConfig {
  onEscape: Option<KeyHandlerApi<TabbingConfig, Stateless>>;
  onEnter: Option<KeyHandlerApi<TabbingConfig, Stateless>>;
  selector: string;
  firstTabstop: number;
  useTabstopAt: (elem: Element) => boolean;
  visibilitySelector: Option<string>;
  cyclic: boolean;
}

export interface AcylicConfigSpec extends TabbingConfigSpec<AcyclicConfig> {
  mode: 'acyclic';
}

export interface CyclicConfigSpec extends TabbingConfigSpec<CyclicConfig> {
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
  onEscape: KeyHandlerApi<EscapingConfig, Stateless>;
}

export interface EscapingConfig extends GeneralKeyingConfig {
  onEscape: KeyHandlerApi<EscapingConfig, Stateless>;
}

// Execution Type
export interface ExecutingConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'execution';
  // NOTE: inconsistent.
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  useSpace?: boolean;
  useEnter?: boolean;
  useControlEnter?: boolean;
  useDown?: boolean;
}

export interface ExecutingConfig extends GeneralKeyingConfig {
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  useSpace: boolean;
  useEnter: boolean;
  useControlEnter: boolean;
  useDown: boolean;
}

// Flatgrid type
export interface FlatgridConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flatgrid';
  selector: string;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  onEscape?: KeyHandlerApi<FlatgridConfig, FlatgridState>;
  captureTab?: boolean;
  initSize: {
    numColumns: number;
    numRows: number;
  };
}

export interface FlatgridConfig extends GeneralKeyingConfig {
  selector: string;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  onEscape: KeyHandlerApi<FlatgridConfig, FlatgridState>;
  captureTab: boolean;
  initSize: {
    numColumns: number;
    numRows: number;
  };
}

export interface FlatgridState extends BehaviourState {
  getNumRows: () => Option<number>;
  getNumColumns: () => Option<number>;
  setGridSize: (numRows: number, numColumns: number) => void;
}

// Flow type
export interface FlowConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flow';
  selector: string;
  getInitial?: (comp: AlloyComponent) => Option<Element>;
  onEscape?: KeyHandlerApi<FlowConfig, Stateless>;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  executeOnMove?: boolean;
  allowVertical?: boolean;
}

export interface FlowConfig extends GeneralKeyingConfig {
  selector: string;
  getInitial: (comp: AlloyComponent) => Option<Element>;
  onEscape: KeyHandlerApi<FlowConfig, Stateless>;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  executeOnMove: boolean;
  allowVertical: boolean;
}

// Matrix type
export interface MatrixConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'matrix';
  selectors: {
    row: string;
    cell: string;
  };
  cycles?: boolean;
  previousSelector?: (comp: AlloyComponent) => Option<Element>;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
}

export interface MatrixConfig extends GeneralKeyingConfig {
  selectors: {
    row: string;
    cell: string;
  };
  cycles: boolean;
  previousSelector: (comp: AlloyComponent) => Option<Element>;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
}

// Menu type
export interface MenuConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'menu';
  selector: string;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  moveOnTab?: boolean;
}

export interface MenuConfig extends GeneralKeyingConfig {
  selector: string;
  execute: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: Element) => Option<boolean>;
  moveOnTab: boolean;
}

export interface SpecialConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'special';
  onSpace?: KeyHandlerApi<SpecialConfig, Stateless>;
  onEnter?: KeyHandlerApi<SpecialConfig, Stateless>;
  onShiftEnter?: KeyHandlerApi<SpecialConfig, Stateless>;
  onLeft?: KeyHandlerApi<SpecialConfig, Stateless>;
  onRight?: KeyHandlerApi<SpecialConfig, Stateless>;
  onTab?: KeyHandlerApi<SpecialConfig, Stateless>;
  onShiftTab?: KeyHandlerApi<SpecialConfig, Stateless>;
  onUp?: KeyHandlerApi<SpecialConfig, Stateless>;
  onDown?: KeyHandlerApi<SpecialConfig, Stateless>;
  onEscape?: KeyHandlerApi<SpecialConfig, Stateless>;
  stopSpaceKeyup?: boolean;
  focusIn?: (comp: AlloyComponent, info: SpecialConfig) => void;
}

export interface SpecialConfig extends GeneralKeyingConfig {
  onSpace?: KeyHandlerApi<SpecialConfig, Stateless>;
  onEnter?: KeyHandlerApi<SpecialConfig, Stateless>;
  onShiftEnter?: KeyHandlerApi<SpecialConfig, Stateless>;
  onLeft?: KeyHandlerApi<SpecialConfig, Stateless>;
  onRight?: KeyHandlerApi<SpecialConfig, Stateless>;
  onTab?: KeyHandlerApi<SpecialConfig, Stateless>;
  onShiftTab?: KeyHandlerApi<SpecialConfig, Stateless>;
  onUp?: KeyHandlerApi<SpecialConfig, Stateless>;
  onDown?: KeyHandlerApi<SpecialConfig, Stateless>;
  onEscape?: KeyHandlerApi<SpecialConfig, Stateless>;
  stopSpaceKeyup: boolean;
  focusIn?: Option<(comp: AlloyComponent, info: SpecialConfig) => Option<boolean>>;
}
