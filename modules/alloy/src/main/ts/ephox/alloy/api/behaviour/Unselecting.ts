import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';
import { UnselectingBehaviour } from '../../behaviour/unselecting/UnselectingTypes';
import * as Behaviour from './Behaviour';

const Unselecting: UnselectingBehaviour = Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
});

export {
  Unselecting
};
