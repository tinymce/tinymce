import * as Behaviour from './Behaviour';
import * as SwapApis from '../../behaviour/swapping/SwapApis';
import SwapSchema from '../../behaviour/swapping/SwapSchema';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

export interface SwappingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: SwappingConfig) => { [key: string]: (any) => any };
  toAlpha?: (componenet: AlloyComponent) => void;
  toOmega?: (componenet: AlloyComponent) => void;
  isAlpha?: (componenet: AlloyComponent) => boolean;
  isOmega?: (componenet: AlloyComponent) => boolean;
  clear?: (componenet: AlloyComponent) => void;
}

export interface SwappingConfig extends Behaviour.AlloyBehaviourConfig {
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