import * as Behaviour from './Behaviour';
import * as ActiveFocus from '../../behaviour/focusing/ActiveFocus';
import * as FocusApis from '../../behaviour/focusing/FocusApis';
import FocusSchema from '../../behaviour/focusing/FocusSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface FocusingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: FocusingConfig) => { [key: string]: (any) => any };
  focus: (component: AlloyComponent) => void;
  isFocused: (component: AlloyComponent) => boolean;
}

export interface FocusingConfig {
  onFocus?: (any) => any;
  ignore?: boolean;
}

const Focusing = Behaviour.create({
  fields: FocusSchema,
  name: 'focusing',
  active: ActiveFocus,
  apis: FocusApis
  // Consider adding isFocused an an extra
}) as FocusingBehaviour;

export {
  Focusing
};