import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface SwappingBehaviour extends Behaviour.AlloyBehaviour<SwappingConfigSpec, SwappingConfig> {
  config: (config: SwappingConfigSpec) => Behaviour.NamedConfiguredBehaviour<SwappingConfigSpec, SwappingConfig>;
  toAlpha?: (component: AlloyComponent) => void;
  toOmega?: (component: AlloyComponent) => void;
  isAlpha?: (component: AlloyComponent) => boolean;
  isOmega?: (component: AlloyComponent) => boolean;
  clear?: (component: AlloyComponent) => void;
}

export interface SwappingConfig extends BehaviourConfigDetail {
  alpha: () => string;
  omega: () => string;
};

export interface SwappingConfigSpec extends BehaviourConfigSpec {
  alpha: string;
  omega: string;
}