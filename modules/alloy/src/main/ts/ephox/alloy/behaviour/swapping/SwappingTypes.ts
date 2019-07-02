import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface SwappingBehaviour extends Behaviour.AlloyBehaviour<SwappingConfigSpec, SwappingConfig> {
  config: (config: SwappingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SwappingConfigSpec, SwappingConfig>;
  toAlpha?: (component: AlloyComponent) => void;
  toOmega?: (component: AlloyComponent) => void;
  isAlpha?: (component: AlloyComponent) => boolean;
  isOmega?: (component: AlloyComponent) => boolean;
  clear?: (component: AlloyComponent) => void;
}

export interface SwappingConfig extends Behaviour.BehaviourConfigDetail {
  alpha: string;
  omega: string;
}

export interface SwappingConfigSpec extends Behaviour.BehaviourConfigSpec {
  alpha: string;
  omega: string;
}
