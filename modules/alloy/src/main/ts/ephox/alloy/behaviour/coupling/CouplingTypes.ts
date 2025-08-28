import { Optional } from '@ephox/katamari';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../common/BehaviourState';

export interface CouplingBehaviour extends Behaviour.AlloyBehaviour<CouplingConfigSpec, CouplingConfig> {
  config: (config: CouplingConfigSpec) => Behaviour.NamedConfiguredBehaviour<CouplingConfigSpec, CouplingConfig>;
  // This will get *OR CREATE* (if it hasn't been created) the coupled component.
  getCoupled: (component: AlloyComponent, name: string) => AlloyComponent;
  // Unlike getCoupled, this will *NOT* create the coupled component if it doesn't already exist
  getExistingCoupled: (comopnent: AlloyComponent, name: string) => Optional<AlloyComponent>;
}

export interface CouplingConfigSpec extends Behaviour.BehaviourConfigSpec {
  others: { [key: string]: (comp: AlloyComponent) => AlloySpec };
}

export interface CouplingState extends BehaviourState {
  getOrCreate: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => AlloyComponent;
  getExisting: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => Optional<AlloyComponent>;
}

export interface CouplingConfig extends Behaviour.BehaviourConfigDetail {
  others: { [key: string]: () => ((comp: AlloyComponent) => AlloySpec) };
}
