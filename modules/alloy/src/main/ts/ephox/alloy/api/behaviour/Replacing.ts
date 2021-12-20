import { FieldSchema } from '@ephox/boulder';

import * as ReplaceApis from '../../behaviour/replacing/ReplaceApis';
import { ReplacingBehaviour } from '../../behaviour/replacing/ReplacingTypes';
import * as Behaviour from './Behaviour';

const Replacing: ReplacingBehaviour = Behaviour.create({
  fields: [
    FieldSchema.defaultedBoolean('reuseDom', true)
  ],
  name: 'replacing',
  apis: ReplaceApis
});

export {
  Replacing
};
