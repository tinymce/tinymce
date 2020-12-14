import * as ActiveTooltipping from '../../behaviour/tooltipping/ActiveTooltipping';
import * as TooltippingApis from '../../behaviour/tooltipping/TooltippingApis';
import TooltippingSchema from '../../behaviour/tooltipping/TooltippingSchema';
import * as TooltippingState from '../../behaviour/tooltipping/TooltippingState';
import { TooltippingBehaviour } from '../../behaviour/tooltipping/TooltippingTypes';
import * as Behaviour from './Behaviour';

const Tooltipping: TooltippingBehaviour = Behaviour.create({
  fields: TooltippingSchema,
  name: 'tooltipping',
  active: ActiveTooltipping,
  state: TooltippingState,
  apis: TooltippingApis
});

export {
  Tooltipping
};
