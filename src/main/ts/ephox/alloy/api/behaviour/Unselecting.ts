import * as Behaviour from './Behaviour';
import * as ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';

export default <any> Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
});