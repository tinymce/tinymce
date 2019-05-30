import * as Behaviour from '../../api/behaviour/Behaviour';

export interface TabstoppingBehaviour extends Behaviour.AlloyBehaviour<TabstoppingConfigSpec, TabstoppingConfig> {
  config: (config: TabstoppingConfigSpec) => Behaviour.NamedConfiguredBehaviour<TabstoppingConfigSpec, TabstoppingConfig>;
}
export interface TabstoppingConfigSpec extends Behaviour.BehaviourConfigSpec {
  // intentionally blank
}

export interface TabstoppingConfig extends Behaviour.BehaviourConfigDetail {
  tabAttr: string;
}
