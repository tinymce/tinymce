import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';


export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: UnselectingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
}

export interface UnselectingConfigSpec {
  // intentionally blank
}

export interface UnselectingConfig { };