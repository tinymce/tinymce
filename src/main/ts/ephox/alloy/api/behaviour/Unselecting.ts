import * as Behaviour from './Behaviour';
import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';

export interface UnselectingBehaviour extends Behaviour.AlloyBehaviour {
  config: (config: UnselectingConfig) => { [key: string]: (any) => any };
}

export interface UnselectingConfig {
  // intentionally blank
}

const Unselecting = Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
}) as UnselectingBehaviour;

export {
  Unselecting
};