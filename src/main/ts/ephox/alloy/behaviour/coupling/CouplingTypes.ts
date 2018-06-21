
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../../behaviour/common/BehaviourState';
import { BehaviourConfigSpec, BehaviourConfigDetail } from '../../api/behaviour/Behaviour';



export interface CouplingBehaviour extends Behaviour.AlloyBehaviour<CouplingConfigSpec, CouplingConfig> {
  config: (config: CouplingConfigSpec) => Behaviour.NamedConfiguredBehaviour<CouplingConfigSpec, CouplingConfig>;
  getCoupled: (component: AlloyComponent, name: string) => AlloyComponent;
}

export interface CouplingConfigSpec extends BehaviourConfigSpec {
  others: { [key: string]: (comp: AlloyComponent) => AlloySpec };
}

export interface CouplingState extends BehaviourState {
  getOrCreate: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => AlloyComponent;
}

export interface CouplingConfig extends BehaviourConfigDetail {
  others: () => { [key: string]: () => ((comp: AlloyComponent) => AlloySpec) };
}