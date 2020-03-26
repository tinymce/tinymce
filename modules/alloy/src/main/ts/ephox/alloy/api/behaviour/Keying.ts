import { console } from '@ephox/dom-globals';
import { Obj } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../../behaviour/common/BehaviourState';
import * as KeyboardBranches from '../../behaviour/keyboard/KeyboardBranches';
import * as KeyingState from '../../behaviour/keyboard/KeyingState';
import { AcylicConfigSpec, CyclicConfigSpec, ExecutingConfigSpec, FlatgridConfigSpec, FlatgridState, FlowConfigSpec, GeneralKeyingConfig, MatrixConfigSpec, MenuConfigSpec, SpecialConfigSpec } from '../../keying/KeyingModeTypes';
import * as Behaviour from './Behaviour';

export interface KeyingBehaviour<D extends GeneralKeyingConfig> extends Behaviour.AlloyBehaviour<KeyingConfigSpec, D> {
  config: (config: KeyingConfigSpec) => Behaviour.NamedConfiguredBehaviour<KeyingConfigSpec, D>;
  focusIn: (component: AlloyComponent) => void;
  setGridSize: (
    component: AlloyComponent,
    numRows: number,
    numColumns: number,
  ) => void;
}

type KeyingState = Stateless | FlatgridState;

export type KeyingConfigSpec =
  AcylicConfigSpec | CyclicConfigSpec | FlowConfigSpec | FlatgridConfigSpec |
  MatrixConfigSpec | ExecutingConfigSpec | MenuConfigSpec | SpecialConfigSpec;

// TODO: dynamic type, TODO: group these into their KeyingModes
export type KeyingModes = 'acyclic' | 'cyclic' | 'flow' | 'flatgrid' | 'matrix' | 'execution' | 'menu' | 'special';

const isFlatgridState = (keyState: KeyingState): keyState is FlatgridState => Obj.hasNonNullableKey(keyState as any, 'setGridSize');

const Keying: KeyingBehaviour<any> = Behaviour.createModes({
  branchKey: 'mode',
  branches: KeyboardBranches,
  name: 'keying',
  active: {
    events(keyingConfig: GeneralKeyingConfig, keyingState: KeyingState) {
      const handler = keyingConfig.handler;
      return handler.toEvents(keyingConfig, keyingState);
    }
  },
  apis: {
    focusIn(component: AlloyComponent, keyConfig: GeneralKeyingConfig, keyState: KeyingState) {
      // If we have a custom sendFocusIn function, use that.
      // Otherwise, we just trigger focus on the outer element.
      keyConfig.sendFocusIn(keyConfig).fold(
        () => {
          component.getSystem().triggerFocus(component.element(), component.element());
        },
        (sendFocusIn) => {
          sendFocusIn(component, keyConfig, keyState);
        }
      );
    },

    // These APIs are going to be interesting because they are not
    // available for all keying modes
    setGridSize <S>(component: AlloyComponent, keyConfig: GeneralKeyingConfig, keyState: KeyingState, numRows: number, numColumns: number) {
      if (!isFlatgridState(keyState)) {
        // tslint:disable-next-line:no-console
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
