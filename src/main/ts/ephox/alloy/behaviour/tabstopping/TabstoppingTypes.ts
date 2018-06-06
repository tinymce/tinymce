import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Option } from '@ephox/katamari';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: TabstoppingConfig) => Behaviour.NamedConfiguredBehaviour;
}
export interface TabstoppingConfig {
  // intentionally blank
}
