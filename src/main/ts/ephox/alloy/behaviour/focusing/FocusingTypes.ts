import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface FocusingBehaviour extends Behaviour.AlloyBehaviour<FocusingConfigSpec, FocusingConfig> {
  config: (config: FocusingConfigSpec) => Behaviour.NamedConfiguredBehaviour<FocusingConfigSpec, FocusingConfig>;
  focus: (component: AlloyComponent) => void;
  isFocused: (component: AlloyComponent) => boolean;
}

export interface FocusingConfigSpec extends BehaviourConfigSpec {
  onFocus?: (comp: AlloyComponent) => void;
  ignore?: boolean;
}

export interface FocusingConfig extends Behaviour.BehaviourConfigDetail {
  ignore: () => boolean;
  onFocus: () => (comp: AlloyComponent) => void;
}