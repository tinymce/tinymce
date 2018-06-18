import * as Behaviour from './Behaviour';
import * as KeyboardBranches from '../../behaviour/keyboard/KeyboardBranches';
import * as KeyingState from '../../behaviour/keyboard/KeyingState';
import { Objects } from '@ephox/boulder';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { SimulatedEvent, NativeSimulatedEvent } from '../../events/SimulatedEvent';
import { FocusManagers } from '../../api/Main';
import { AcylicConfigSpec, CyclicConfigSpec, FlowConfigSpec, FlatgridConfigSpec, MatrixConfigSpec, ExecutingConfigSpec, MenuConfigSpec, SpecialConfigSpec } from 'ephox/alloy/keying/KeyingModeTypes';
import { console } from '@ephox/dom-globals';

export interface KeyingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: KeyingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  focusIn: (component: AlloyComponent) => void;
  setGridSize: (
    component: AlloyComponent,
    numRows: number,
    numColumns: number,
  ) => void;
}

export type KeyingConfigSpec =
  AcylicConfigSpec | CyclicConfigSpec | FlowConfigSpec | FlatgridConfigSpec |
  MatrixConfigSpec | ExecutingConfigSpec | MenuConfigSpec | SpecialConfigSpec;


// TODO: dynamic type, TODO: group these into their KeyingModes
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