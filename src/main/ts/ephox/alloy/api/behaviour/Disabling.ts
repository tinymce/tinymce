import * as Behaviour from './Behaviour';
import * as ActiveDisable from '../../behaviour/disabling/ActiveDisable';
import * as DisableApis from '../../behaviour/disabling/DisableApis';
import DisableSchema from '../../behaviour/disabling/DisableSchema';
import { DisableBehaviour } from 'ephox/alloy/behaviour/disabling/DisableTypes';

const Disabling = Behaviour.create({
  fields: DisableSchema,
  name: 'disabling',
  active: ActiveDisable,
  apis: DisableApis
}) as DisableBehaviour;

export {
  Disabling
};