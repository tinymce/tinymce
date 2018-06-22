import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface FocusingBehaviour extends Behaviour.AlloyBehaviour<FocusingConfigSpec, FocusingConfig> {
  config: (config: FocusingConfigSpec) => Behaviour.NamedConfiguredBehaviour<FocusingConfigSpec, FocusingConfig>;
  focus: (component: AlloyComponent) => void;
  isFocused: (component: AlloyComponent) => boolean;
}

export interface FocusingConfigSpec extends BehaviourConfigSpec {
  onFocus?: (AlloyComponent) => void;
  ignore?: boolean;
}

export interface FocusingConfig extends BehaviourConfigDetail {
  ignore: () => boolean;
  onFocus: () => (AlloyComponent) => void;
}