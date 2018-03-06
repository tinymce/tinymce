import * as Behaviour from './Behaviour';
import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';
import { AlloyBehaviour, AlloyBehaviourConfig } from 'ephox/alloy/alien/TypeDefinitions';

export interface UnselectingBehaviour extends AlloyBehaviour {
  config: (UnselectingConfig) => { key: string, value: any };
}

export interface UnselectingConfig extends AlloyBehaviourConfig {
  // intentionally blank
}

const Unselecting: UnselectingBehaviour = Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
});

export {
  Unselecting
};