import * as Behaviour from './Behaviour';
import KeyboardBranches from '../../behaviour/keyboard/KeyboardBranches';
import * as KeyingState from '../../behaviour/keyboard/KeyingState';
import { Objects } from '@ephox/boulder';
import { SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/boulder/node_modules/@ephox/katamari';
import { SimulatedEvent } from 'ephox/alloy/events/SimulatedEvent';
import { FocusManagers } from 'ephox/alloy/api/Main';

export interface KeyingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: KeyingConfig) => { [key: string]: (any) => any };
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

  useSpace?: boolean;
  useEnter?: boolean;
  useControlEnter?: boolean;
  executeOnMove?: boolean;
  focusIn?: (comp: AlloyComponent, keyInfo: KeyingInfo) => void;

  focusManager?: KeyingFocusManager;
  selectors?: { row: string, cell: string };

  moveOnTab?: boolean;

  onSpace?: (comp: AlloyComponent) => Option<boolean>;
  onDown?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onUp?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onLeft?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onRight?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onEnter?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onEscape?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  onShiftEnter?: (comp: AlloyComponent, simulatedEvent: SimulatedEvent) => Option<boolean>;
  useTabstopAt?: (comp: AlloyComponent) => Option<boolean>;
}

// TODO: Morgan, perhaps try a Partial<Record <'mode', KeyingModes>>
export type KeyingModes = 'acyclic' | 'cyclic' | 'flow' | 'flatgrid' | 'matrix' | 'execution' | 'menu' | 'special';

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