import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: UnselectingConfig) => Behaviour.NamedConfiguredBehaviour;
}

export interface UnselectingConfig {
  // intentionally blank
}