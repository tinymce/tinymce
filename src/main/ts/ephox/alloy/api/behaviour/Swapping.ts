import * as Behaviour from './Behaviour';
import * as SwapApis from '../../behaviour/swapping/SwapApis';
import SwapSchema from '../../behaviour/swapping/SwapSchema';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SwappingBehaviour } from '../../behaviour/swapping/SwappingTypes';

const Swapping = Behaviour.create({
  fields: SwapSchema,
  name: 'swapping',
  apis: SwapApis
}) as SwappingBehaviour;

export {
  Swapping
};