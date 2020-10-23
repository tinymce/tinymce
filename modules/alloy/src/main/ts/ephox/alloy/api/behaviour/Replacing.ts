import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { ReplacingBehaviour } from '../../behaviour/replacing/ReplacingTypes';
import * as Behaviour from './Behaviour';

const Replacing: ReplacingBehaviour = Behaviour.create({
  fields: [ ],
  name: 'replacing',
  apis: ReplaceApis
});

export {
  Replacing
};
