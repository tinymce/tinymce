import * as Behaviour from './Behaviour';
import KeyboardBranches from '../../behaviour/keyboard/KeyboardBranches';
import * as KeyingState from '../../behaviour/keyboard/KeyingState';
import { Objects } from '@ephox/boulder';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { FocusManagers } from '../../api/Main';
import { console } from '@ephox/dom-globals';

export interface KeyingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: KeyingConfig) => Behaviour.NamedConfiguredBehaviour;
  focusIn: (component: AlloyComponent) => void;
  setGridSize: (
    component: AlloyComponent,
    numRows: number,
    numColumns: number,
  ) => void;
}

export interface KeyingInfo {
  focusIn: () => any;
  focusManager: () => any;
  handler: () => any;
  onDown: () => any;
  onEnter: () => any;
  onEscape: () => any;
  onLeft: () => any;
  onRight: () => any;
  onShiftEnter: () => any;
  onShiftTab: () => any;
  onSpace: () => any;
  onTab: () => any;
  onUp: () => any;
  state: () => any;
}

export interface KeyingFocusManager {
  set: (component: AlloyComponent, focusee: any) => void;
  get: (component: AlloyComponent) => AlloyComponent;
}

// TODO: dynamic type, TODO: group these into their KeyingModes
export type KeyingModes = 'acyclic' | 'cyclic' | 'flow' | 'flatgrid' | 'matrix' | 'execution' | 'menu' | 'special';

export interface KeyingConfig {
  mode: KeyingModes;

  selector?: string;
  visibilitySelector?: string;

  initSize?: {
    numColumns: number,
    numRows: number
  };
  getInitial?: (chooser) => Option<SugarElement>;
  execute?: (chooser, simulatedEvent, focused) => boolean;
  executeOnMove?: boolean;
  allowVertical?: boolean;

  cycles?: boolean;
  useSpace?: boolean;
  useEnter?: boolean;
  useControlEnter?: boolean;
  captureTab?: boolean;

  focusIn?: (comp: AlloyComponent, keyInfo: KeyingInfo) => void;

  focusManager?: KeyingFocusManager;
  selectors?: { row: string, cell: string };

  moveOnTab?: boolean;

  onSpace?: (comp: AlloyComponent) => Option<boolean>;
  onDown?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onUp?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onLeft?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onRight?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEnter?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onShiftEnter?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onShiftTab?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  onTab?: (comp: AlloyComponent, simulatedEvent: NativeSimulatedEvent) => Option<boolean>;
  useTabstopAt?: (comp: AlloyComponent) => boolean;
}

// This commented out section is a more concise schema of what should be the configuration item, based on the KeyingConfig.mode
// eg: if mode = special, then we expect the config to only contain members defined in SpecialConfig
// The current implementation does a catch all KeyingConfig, which defeats the point of typescript.
// I have not found a pattern that does this kind of evaluation matching, maybe we have to re-structure the config tree
//           const config = {
//             mode: 'special',
//             cfg: SpecialConfig
//           }
// The Typescript/Boulder relationship also adds additional complexity where Typescript is Parse time and Boulder is a Runtime compiler.
// Boulder will use defaulted fallbacks to populate the configs at runtime where as Typescript will complain and we have to use optional?
// which can mask issues.
// I will leave the succinct configs in comments, until we find a better solution

// export interface SpecialConfig {
//   onSpace: (comp: AlloyComponent) => Option<boolean>;
//   onEnter: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onShiftEnter: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onLeft: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onRight: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onTab: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onShiftTab: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onUp: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onDown: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onEscape: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   focusIn?: (comp: AlloyComponent, keyInfo: KeyingInfo) => void;
// }

// export interface MenuConfig {
//   selector: string;
//   execute: (chooser, simulatedEvent, focused) => boolean;
//   moveOnTab?: boolean;
// }

// export interface ExecutionConfig {
//   execute: (chooser, simulatedEvent, focused) => boolean;
//   useSpace?: boolean;
//   useEnter?: boolean;
//   useControlEnter?: boolean;
//   useDown?: boolean;
// }
// export interface MatrixConfig<T> {
//   selectors: { row: string, cell: string };
//   cycles: boolean;
//   previousSelector: Option<T>;
//   execute: (chooser, simulatedEvent, focused) => boolean;
// }
// export interface FlatgridConfig {
//   selector: string;
//   execute: (chooser, simulatedEvent, focused) => boolean;
//   onEscape: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   captureTab: boolean;
// }
// export interface FlowConfig {
//   selector: string;
//   getInitial: (chooser) => Option<SugarElement>;
//   execute: (chooser, simulatedEvent, focused) => boolean;
//   executeOnMove: boolean;
//   allowVertical: boolean;
// }
// export interface TabbingConfig {
//   onEscape: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   onEnter: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
//   selector: string;
//   visibilitySelector: string;
//   firstTabstop: any;
//   useTabstopAt: (comp: AlloyComponent) => Option<boolean>;
// }
// export interface AcyclicConfig extends TabbingConfig {
//   cyclic: 'false';
// }

// export interface CyclicConfig extends TabbingConfig {
//   cyclic: 'true';
// }

const Keying = Behaviour.createModes({
  branchKey: 'mode',
  branches: KeyboardBranches,
  name: 'keying',
  active: {
    events (keyingConfig, keyingState) {
      const handler = keyingConfig.handler();
      return handler.toEvents(keyingConfig, keyingState);
    }
  },
  apis: {
    focusIn (component/*, keyConfig, keyState */) {
      // TODO: Should this use the focusManager?
      component.getSystem().triggerFocus(component.element(), component.element());
    },

    // These APIs are going to be interesting because they are not
    // available for all keying modes
    setGridSize (component, keyConfig, keyState, numRows, numColumns) {
      if (! Objects.hasKey(keyState, 'setGridSize')) {
        console.error('Layout does not support setGridSize');
      } else {
        keyState.setGridSize(numRows, numColumns);
      }
    }
  },
  state: KeyingState
}) as KeyingBehaviour;

export {
  Keying
};