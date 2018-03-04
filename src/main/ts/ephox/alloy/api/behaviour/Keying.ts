import * as Behaviour from './Behaviour';
import KeyboardBranches from '../../behaviour/keyboard/KeyboardBranches';
import * as KeyingState from '../../behaviour/keyboard/KeyingState';
import { Objects } from '@ephox/boulder';
import { AlloyBehaviour, AlloyBehaviourConfig, SugarElement } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';

export interface KeyingBehaviour extends AlloyBehaviour {
  config: (KeyingConfig) => any;
  focusIn: (component: AlloyComponent) => void;
  setGridSize: (
    component: AlloyComponent,
    numRows: number,
    numColumns: number,
  ) => void;
}

export interface KeyingConfig extends AlloyBehaviourConfig {
  mode: KeyingModes;
  selector: string;
  visibilitySelector: string;
  useSpace: boolean;
  useEnter: boolean;
  executeOnMove: boolean;
  getInitial: (chooser) => SugarElement;
  execute: (any) => any;
  onEnter: () => () => any;
  onEscape: () => () => any;
  useTabstopAt: () => () => any;
}

export type KeyingModes = 'acyclic' | 'cyclic' | 'flow' | 'flatgrid' | 'matrix' | 'execution' | 'menu' | 'special';

const Keying: KeyingBehaviour = Behaviour.createModes({
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
});

export {
  Keying
};