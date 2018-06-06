import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface FocusingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: FocusingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  focus: (component: AlloyComponent) => void;
  isFocused: (component: AlloyComponent) => boolean;
}

export interface FocusingConfigSpec {
  onFocus?: (AlloyComponent) => void;
  ignore?: boolean;
}

export interface FocusingConfig {
  ignore: () => boolean;
  onFocus: () => (AlloyComponent) => void;
}