import Behaviour from './Behaviour';
import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';

export default <any> Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
});