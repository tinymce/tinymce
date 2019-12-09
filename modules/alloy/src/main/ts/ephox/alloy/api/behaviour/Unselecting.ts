import * as Behaviour from './Behaviour';
import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';
import { UnselectingBehaviour } from '../../behaviour/unselecting/UnselectingTypes';

const Unselecting: UnselectingBehaviour = Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
});

export {
  Unselecting
};
