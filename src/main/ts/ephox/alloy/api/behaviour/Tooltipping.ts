import { TooltippingBehaviour } from '../../behaviour/tooltipping/TooltippingTypes';
import TooltippingSchema from '../../behaviour/tooltipping/TooltippingSchema';
import * as TooltippingState from '../../behaviour/tooltipping/TooltippingState';
import * as Behaviour from './Behaviour';

const Tooltipping = Behaviour.create({
  fields: TooltippingSchema,
  name: 'tooltipping',
  state: TooltippingState
}) as TooltippingBehaviour;

export {
  Tooltipping
};