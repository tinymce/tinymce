import * as Behaviour from './Behaviour';
import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';

export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour {
  config: (UnselectingConfig) => { key: string, value: any };
}

export interface UnselectingConfig extends Behaviour.AlloyBehaviourConfig {
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