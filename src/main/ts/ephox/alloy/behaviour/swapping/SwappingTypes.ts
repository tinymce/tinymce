import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface SwappingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SwappingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  toAlpha?: (component: AlloyComponent) => void;
  toOmega?: (component: AlloyComponent) => void;
  isAlpha?: (component: AlloyComponent) => boolean;
  isOmega?: (component: AlloyComponent) => boolean;
  clear?: (component: AlloyComponent) => void;
}

export interface SwappingConfig {
  alpha: () => string;
  omega: () => string;
};

export interface SwappingConfigSpec {
  alpha: string;
  omega: string;
}