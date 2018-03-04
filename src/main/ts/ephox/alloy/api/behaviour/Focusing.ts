import * as Behaviour from './Behaviour';
import * as ActiveFocus from '../../behaviour/focusing/ActiveFocus';
import * as FocusApis from '../../behaviour/focusing/FocusApis';
import FocusSchema from '../../behaviour/focusing/FocusSchema';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/Component';

export interface FocusingBehaviour extends AlloyBehaviour {
  config: (FocusingConfig) => any;
  focus?: (component: AlloyComponent) => void;
  isFocused?: (component: AlloyComponent) => boolean;
}

export interface FocusingConfig extends AlloyBehaviourConfig {
  onFocus?: (any) => any;
  ignore?: boolean;
}

const Focusing: FocusingBehaviour = Behaviour.create({
  fields: FocusSchema,
  name: 'focusing',
  active: ActiveFocus,
  apis: FocusApis
  // Consider adding isFocused an an extra
});

export {
  Focusing
};