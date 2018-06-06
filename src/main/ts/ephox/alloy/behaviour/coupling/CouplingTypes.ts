
import * as Behaviour from '../../api/behaviour/Behaviour';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';


export interface CouplingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: CouplingConfigSpec) => Behaviour.NamedConfiguredBehaviour;
  getCoupled: (component, coupleConfig, coupleState?, name?) => AlloyComponent;
}

export interface CouplingConfigSpec {
  others: { [key: string]: (AlloyComponent) => AlloySpec };
}

export interface CouplingState {
  getOrCreate: (component: AlloyComponent, coupleConfig: CouplingConfig, name: string) => AlloyComponent;
}

export interface CouplingConfig {
  others: () => { [key: string]: () => ((AlloyComponent) => AlloySpec) };
}