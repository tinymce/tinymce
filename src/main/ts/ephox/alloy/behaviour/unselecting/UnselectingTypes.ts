import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';


export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour<UnselectingConfigSpec, UnselectingConfig> {
  config: (config: UnselectingConfigSpec) => Behaviour.NamedConfiguredBehaviour<UnselectingConfigSpec, UnselectingConfig>;
}

export interface UnselectingConfigSpec extends BehaviourConfigSpec {
  // intentionally blank
}

export interface UnselectingConfig extends BehaviourConfigDetail { };