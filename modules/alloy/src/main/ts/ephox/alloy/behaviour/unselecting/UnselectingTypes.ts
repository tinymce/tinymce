import * as Behaviour from '../../api/behaviour/Behaviour';

export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour<UnselectingConfigSpec, UnselectingConfig> {
  config: (config: UnselectingConfigSpec) => Behaviour.NamedConfiguredBehaviour<UnselectingConfigSpec, UnselectingConfig>;
}

export interface UnselectingConfigSpec extends Behaviour.BehaviourConfigSpec {
  // intentionally blank
}

export interface UnselectingConfig extends Behaviour.BehaviourConfigDetail { }
