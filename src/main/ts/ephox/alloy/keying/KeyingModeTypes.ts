import { SugarElement } from "ephox/alloy/alien/TypeDefinitions";
import { Option } from "@ephox/katamari";
import { AlloyComponent } from "ephox/alloy/api/component/ComponentApi";
import { SimulatedEvent, NativeSimulatedEvent } from "ephox/alloy/events/SimulatedEvent";

export type MogelHandler = (comp: AlloyComponent, se: NativeSimulatedEvent) => Option<boolean>;

export interface GeneralKeyingConfigSpec {
  // TYPIFY
  focusManager?: any;
}

export interface GeneralKeyingConfig {
  focusManager: () => any;
}

export interface TabbingConfigSpec extends GeneralKeyingConfigSpec {
  onEscape?: MogelHandler;
  onEnter?: MogelHandler;
  selector?: string;
  firstTabstop?: number;
  useTabstopAt?: (elem: SugarElement) => boolean;
  visibilitySelector?: string;
}

export interface TabbingConfig extends GeneralKeyingConfig {
  onEscape: () => Option<MogelHandler>;
  onEnter: () => Option<MogelHandler>;
  selector: () => string;
  firstTabstop: () => number;
  useTabstopAt: () => (elem: SugarElement) => boolean;
  visibilitySelector: () => Option<string>;
}

export interface AcylicConfigSpec extends TabbingConfigSpec {
  mode: 'acyclic'
}

export interface CyclicConfigSpec extends TabbingConfigSpec {
  mode: 'cyclic'
}

export interface AyclicConfig extends TabbingConfig {
  cyclic: () => false;
}

export interface CyclicConfig extends TabbingConfig {
  cyclic: () => true;
}

// Escaping Type
export interface EscapingConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'escaping';
  onEscape: MogelHandler
}

export interface EscapingConfig extends GeneralKeyingConfig {
  onEscape: () => MogelHandler;
}

// Execution Type
export interface ExecutingConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'execution';
  execute?:MogelHandler;
  useSpace?: boolean;
  useEnter?: boolean;
  useControlEnter?: boolean;
  useDown?: boolean;
}

export interface ExecutingConfig extends GeneralKeyingConfig {
  execute: () => MogelHandler;
  useSpace: () => boolean;
  useEnter: () => boolean;
  useControlEnter: () => boolean;
  useDown: () => boolean;
}

// Flatgrid type
export interface FlatgridConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flatgrid';
  selector: string;
  execute?: MogelHandler;
  onEscape?: MogelHandler;
  captureTab?: boolean;
  initSize: {
    numColumns: number;
    numRows: number;
  }
};

export interface FlatgridConfig extends GeneralKeyingConfig {
  selector: () => string;
  execute: () => MogelHandler;
  onEscape: () => Option<MogelHandler>;
  captureTab: () => boolean;
  initSize: () => {
    numColumns: () => number;
    numRows: () => number;
  }
}

// Flow type
export interface FlowConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'flow';
  selector: string;
  getInitial?: (comp: AlloyComponent) => Option<SugarElement>;
  execute?: (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement) => Option<boolean>;
  executeOnMove?: boolean;
  allowVertical?: boolean;
}

export interface FlowConfig extends GeneralKeyingConfig {
  selector: () => string;
  getInitial: () => (comp: AlloyComponent) => Option<SugarElement>;
  execute: () => (comp: AlloyComponent, se: NativeSimulatedEvent, focused: SugarElement) => Option<boolean>;
  executeOnMove: () => boolean;
  allowVertical: () => boolean;
}

// Matrix type
export interface MatrixConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'matrix';
  selectors: {
    row: string;
    cell: string;
  };
  cycles?: boolean;
  previousSelector?: (comp: AlloyComponent) => Option<SugarElement>;
  execute?: MogelHandler;
}

export interface MatrixConfig extends GeneralKeyingConfig {
  selectors: () => {
    row: () => string;
    cell: () => string;
  };
  cycles: () => boolean;
  previousSelector: () => (comp: AlloyComponent) => Option<SugarElement>;
  execute: () => MogelHandler;
}

// Menu type
export interface MenuConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'menu';
  selector: string;
  execute?: MogelHandler;
  moveOnTab?: boolean;
}

export interface MenuConfig extends GeneralKeyingConfig {
  selector: () => string;
  execute: () => MogelHandler;
  moveOnTab: () => boolean;
}

export interface SpecialConfigSpec extends GeneralKeyingConfigSpec {
  mode: 'special';
  onSpace?: MogelHandler;
  onEnter?: MogelHandler;
  onShiftEnter?: MogelHandler;
  onLeft?: MogelHandler;
  onRight?: MogelHandler;
  onTab?: MogelHandler;
  onShiftTab?: MogelHandler;
  onUp?: MogelHandler;
  onDown?: MogelHandler;
  onEscape?: MogelHandler;
  focusIn?: (comp: AlloyComponent, info: SpecialConfig) => void;
}

export interface SpecialConfig extends GeneralKeyingConfig {
  onSpace?: () => Option<MogelHandler>;
  onEnter?: () => Option<MogelHandler>;
  onShiftEnter?: () => Option<MogelHandler>;
  onLeft?: () => Option<MogelHandler>;
  onRight?: () => Option<MogelHandler>;
  onTab?: () => Option<MogelHandler>;
  onShiftTab?: () => Option<MogelHandler>;
  onUp?: () => Option<MogelHandler>;
  onDown?: () => Option<MogelHandler>;
  onEscape?: () => Option<MogelHandler>;
  focusIn?: () => Option<(comp: AlloyComponent, info: SpecialConfig) => void>;
}
