import Behaviour from './Behaviour';
import * as ComposeApis from '../../behaviour/composing/ComposeApis';
import ComposeSchema from '../../behaviour/composing/ComposeSchema';

export default <any> Behaviour.create({
  fields: ComposeSchema,
  name: 'composing',
  apis: ComposeApis
});