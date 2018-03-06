import * as Behaviour from './Behaviour';
import * as SwapApis from '../../behaviour/swapping/SwapApis';
import SwapSchema from '../../behaviour/swapping/SwapSchema';
import { AlloyBehaviourConfig, AlloyBehaviour } from 'ephox/alloy/alien/TypeDefinitions';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface SwappingBehaviour extends AlloyBehaviour {
  config: (SwappingConfig) => { key: string, value: any };
  toAlpha?: (componenet: AlloyComponent) => void;
  toOmega?: (componenet: AlloyComponent) => void;
  isAlpha?: (componenet: AlloyComponent) => boolean;
  isOmega?: (componenet: AlloyComponent) => boolean;
  clear?: (componenet: AlloyComponent) => void;
}

export interface SwappingConfig extends AlloyBehaviourConfig {
  alpha: string;
  omega: string;
}

const Swapping: SwappingBehaviour = Behaviour.create({
  fields: SwapSchema,
  name: 'swapping',
  apis: SwapApis
});

export {
  Swapping
};