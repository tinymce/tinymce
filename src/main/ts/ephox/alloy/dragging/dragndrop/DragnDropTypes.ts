import * as Behaviour from '../../api/behaviour/Behaviour';

export interface DragnDropBehaviour extends Behaviour.AlloyBehaviour<DragnDropConfigSpec, DragnDropConfig> {
  config: (config: DragnDropConfigSpec) => Behaviour.NamedConfiguredBehaviour<DragnDropConfigSpec, DragnDropConfig>;
}

export interface DragnDropConfig {
}

export interface DragnDropConfigSpec {
}
