import * as ActiveDisable from '../../behaviour/disabling/ActiveDisable';
import * as DisableApis from '../../behaviour/disabling/DisableApis';
import DisableSchema from '../../behaviour/disabling/DisableSchema';
import { DisableBehaviour } from '../../behaviour/disabling/DisableTypes';
import * as Behaviour from './Behaviour';

const Disabling: DisableBehaviour = Behaviour.create({
  fields: DisableSchema,
  name: 'disabling',
  active: ActiveDisable,
  apis: DisableApis
});

export {
  Disabling
};
