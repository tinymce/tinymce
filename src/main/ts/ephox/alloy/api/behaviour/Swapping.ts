import Behaviour from './Behaviour';
import SwapApis from '../../behaviour/swapping/SwapApis';
import SwapSchema from '../../behaviour/swapping/SwapSchema';



export default <any> Behaviour.create({
  fields: SwapSchema,
  name: 'swapping',
  apis: SwapApis
});