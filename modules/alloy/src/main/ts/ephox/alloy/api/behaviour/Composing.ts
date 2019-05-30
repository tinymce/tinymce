import * as Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import { ComposeSchema } from '../../behaviour/composing/ComposeSchema';
import { ComposingBehaviour } from '../../behaviour/composing/ComposingTypes';

const Composing = Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
}) as ComposingBehaviour;

export {
  Composing
};