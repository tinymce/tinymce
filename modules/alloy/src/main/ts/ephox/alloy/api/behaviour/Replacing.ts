import * as Behaviour from './Behaviour';
import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { ReplacingBehaviour } from '../../behaviour/replacing/ReplacingTypes';

const Replacing = Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
}) as ReplacingBehaviour;

export {
  Replacing
};
