import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface SwappingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SwappingConfig) => Behaviour.NamedConfiguredBehaviour;
  toAlpha?: (componenet: AlloyComponent) => void;
  toOmega?: (componenet: AlloyComponent) => void;
  isAlpha?: (componenet: AlloyComponent) => boolean;
  isOmega?: (componenet: AlloyComponent) => boolean;
  clear?: (componenet: AlloyComponent) => void;
}

export interface SwappingConfig {
  alpha: string;
  omega: string;
}