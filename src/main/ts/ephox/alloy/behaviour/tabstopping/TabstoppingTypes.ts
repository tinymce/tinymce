import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Option } from '@ephox/katamari';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour<TabstoppingConfigSpec, TabstoppingConfig> {
  config: (config: TabstoppingConfigSpec) => Behaviour.NamedConfiguredBehaviour<TabstoppingConfigSpec, TabstoppingConfig>;
}
export interface TabstoppingConfigSpec extends BehaviourConfigSpec {
  // intentionally blank
}

export interface TabstoppingConfig extends BehaviourConfigDetail {
  tabAttr: () => string;
};
