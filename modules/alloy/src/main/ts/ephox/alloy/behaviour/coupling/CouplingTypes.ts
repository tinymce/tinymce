
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../../behaviour/common/BehaviourState';

export interface CouplingBehaviour extends Behaviour.AlloyBehaviour<CouplingConfigSpec, CouplingConfig> {
  config: (config: CouplingConfigSpec) => Behaviour.NamedConfiguredBehaviour<CouplingConfigSpec, CouplingConfig>;
  getCoupled: (component: AlloyComponent, name: string) => AlloyComponent;
}

export interface CouplingConfigSpec extends Behaviour.BehaviourConfigSpec {
  others: { [key: string]: (comp: AlloyComponent) => AlloySpec };
}

export interface CouplingState extends BehaviourState {
  getOrCreate: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => AlloyComponent;
}

export interface CouplingConfig extends Behaviour.BehaviourConfigDetail {
  others: { [key: string]: () => ((comp: AlloyComponent) => AlloySpec) };
}