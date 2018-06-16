
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../../behaviour/common/BehaviourState';


export interface CouplingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: CouplingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  getCoupled: (component: AlloyComponent, name: string) => AlloyComponent;
}

export interface CouplingConfigSpec {
  others: { [key: string]: (comp: AlloyComponent) => AlloySpec };
}

export interface CouplingState extends BehaviourState {
  getOrCreate: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => AlloyComponent;
}

export interface CouplingConfig {
  others: () => { [key: string]: () => ((comp: AlloyComponent) => AlloySpec) };
}