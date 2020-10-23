import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { ComposingBehaviour } from '../../behaviour/composing/ComposingTypes';
import * as Behaviour from './Behaviour';

const Composing: ComposingBehaviour = Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
});

export {
  Composing
};
