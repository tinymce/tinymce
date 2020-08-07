import * as SwapApis from '../../behaviour/swapping/SwapApis';
import { SwappingBehaviour } from '../../behaviour/swapping/SwappingTypes';
import SwapSchema from '../../behaviour/swapping/SwapSchema';
import * as Behaviour from './Behaviour';

const Swapping: SwappingBehaviour = Behaviour.create({
  fields: SwapSchema,
  name: 'swapping',
  apis: SwapApis
});

export {
  Swapping
};
