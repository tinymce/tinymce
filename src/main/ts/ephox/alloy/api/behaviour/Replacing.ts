import * as Behaviour from './Behaviour';
import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { AlloyComponent } from '../../api/component/ComponentApi';


const Replacing = Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
}) as ReplacingBehaviour;

export {
  Replacing
};