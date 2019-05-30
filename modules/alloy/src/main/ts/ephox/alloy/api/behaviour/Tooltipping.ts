import { TooltippingBehaviour } from '../../behaviour/tooltipping/TooltippingTypes';
import TooltippingSchema from '../../behaviour/tooltipping/TooltippingSchema';
import * as TooltippingState from '../../behaviour/tooltipping/TooltippingState';
import * as ActiveTooltipping from '../../behaviour/tooltipping/ActiveTooltipping';
import * as TooltippingApis from '../../behaviour/tooltipping/TooltippingApis';
import * as Behaviour from './Behaviour';

const Tooltipping = Behaviour.create({
  fields: TooltippingSchema,
  name: 'tooltipping',
  active: ActiveTooltipping,
  state: TooltippingState,
  apis: TooltippingApis
}) as TooltippingBehaviour;

export {
  Tooltipping
};