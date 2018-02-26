import Behaviour from './Behaviour';
import ActiveUnselecting from '../../behaviour/unselecting/ActiveUnselecting';

export default <any> Behaviour.create({
  fields: [ ],
  name: 'unselecting',
  active: ActiveUnselecting
});