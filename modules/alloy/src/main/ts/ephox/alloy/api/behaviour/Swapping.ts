import * as Behaviour from './Behaviour';
import * as SwapApis from '../../behaviour/swapping/SwapApis';
import SwapSchema from '../../behaviour/swapping/SwapSchema';
import { SwappingBehaviour } from '../../behaviour/swapping/SwappingTypes';

const Swapping: SwappingBehaviour = Behaviour.create({
  fields: SwapSchema,
  name: 'swapping',
  apis: SwapApis
});

export {
  Swapping
};
