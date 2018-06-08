import * as Behaviour from './Behaviour';
import * as ActiveDocking from '../../behaviour/docking/ActiveDocking';
import DockingSchema from '../../behaviour/docking/DockingSchema';
import { Option } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { SugarElement } from '../../alien/TypeDefinitions';
import { DockingBehaviour } from '../../behaviour/docking/DockingTypes';

const Docking = Behaviour.create({
  fields: DockingSchema,
  name: 'docking',
  active: ActiveDocking
}) as DockingBehaviour;

export {
  Docking
};
